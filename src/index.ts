import * as p from "@clack/prompts";
import rl from "readline";

function validResponse<T>(response: T | symbol): asserts response is T {
  if (p.isCancel(response)) {
    process.exit(0);
  }
}

function fitAsc(charCode: number): number {
  const lowercaseA = "a".charCodeAt(0);
  const lowercaseZ = "z".charCodeAt(0);

  return charCode > lowercaseZ
    ? charCode - lowercaseZ + lowercaseA
    : charCode < lowercaseA
    ? charCode + lowercaseZ - lowercaseA
    : charCode;
}

async function encrypt(value: string): Promise<void> {
  const key = await p.text({
    message: "Insert key:",
    initialValue: "5",
    validate(value) {
      if (!value || /\D/g.test(value)) {
        return "Invalid key";
      }
    },
  });
  validResponse(key);

  let result = "";

  for (let i = 0; i < value.length; i++) {
    if (value[i] === " ") {
      result += " ";
      continue;
    }
    const code = fitAsc(value.charCodeAt(i) + Number(key));
    result += String.fromCharCode(code);
  }

  p.outro(result);
}

async function decrypt(value: string): Promise<void> {
  let key = 0;
  let repeat;

  do {
    key = key % 25;
    p.log.step(`result: ${key + 1} - ${key + 5}  `);
    for (let i = 0; i < 5; i++) {
      key++;
      let result = "";

      for (let j = 0; j < value.length; j++) {
        if (value[j] === " ") {
          result += " ";
          continue;
        }
        const code = fitAsc(value.charCodeAt(j) - key);
        result += String.fromCharCode(code);
      }

      p.log.info(result);
    }

    repeat = await p.confirm({
      message: "Retry?",
    });
    validResponse(repeat);
    if (repeat === true) {
      rl.moveCursor(process.stdout, -999, -15);
    }
  } while (repeat);
}

(async () => {
  const cmd = await p.select({
    message: "Select a function:",
    options: [
      {
        label: "encrypt",
        value: "enc",
      },
      {
        label: "decrypt",
        value: "dec",
      },
    ],
  });
  validResponse(cmd);

  const value = await p.text({
    message: "Insert a string:",
    validate: (value) => {
      if (!value) {
        return "invalid input";
      }
    },
  });
  validResponse(value);

  await (cmd === "dec" ? decrypt(value) : encrypt(value));
})();
