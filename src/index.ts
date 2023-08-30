import * as p from "@clack/prompts";

function validResponse<T>(response: T | symbol): asserts response is T {
  if (p.isCancel(response)) {
    process.exit(0);
  }
}

function fitAsc(code: number): number {
  const firstCode = "a".charCodeAt(0);
  const lastCode = "z".charCodeAt(0);
  return code > lastCode
    ? code - lastCode + firstCode - 1
    : code < firstCode
    ? code + lastCode - firstCode + 1
    : code;
}

async function encrypt(value: string): Promise<void> {
  const key = await p.text({
    message: "Insira a chave:",
    initialValue: "5",
    validate(value) {
      if (/\D/g.test(value)) {
        return "Chave inválida";
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
  let result;
  let repeat;
  do {
    key++;
    result = "";

    for (let i = 0; i < value.length; i++) {
      if (value[i] === " ") {
        result += " ";
        continue;
      }
      const code = fitAsc(value.charCodeAt(i) - key);
      result += String.fromCharCode(code);
    }

    p.log.info(result);
    repeat = await p.confirm({
      message: "Tentar novamente?",
      active: "sim",
      inactive: "não",
    });
    validResponse(repeat);
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
  });
  validResponse(value);

  await (cmd === "dec" ? decrypt(value) : encrypt(value));
})();
