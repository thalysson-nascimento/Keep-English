// Isolated UI preview: real component and translations, simulated auth responses.
import { build } from "esbuild";
import { createServer } from "node:http";
import { resolve } from "node:path";

const result = await build({
  stdin: {
    contents: `import { createRoot } from 'react-dom/client';
      import { DeleteAccountButton } from './src/features/profile/presentation/delete-account-button';
      import { LocaleProvider } from './src/shared/i18n/locale-provider';
      import './src/shared/styles/tokens.css';
      createRoot(document.getElementById('root')).render(<LocaleProvider locale="pt-BR"><DeleteAccountButton /></LocaleProvider>);`,
    loader: "tsx",
    resolveDir: resolve("."),
  },
  outfile: "preview.js",
  bundle: true,
  write: false,
  jsx: "automatic",
  plugins: [
    {
      name: "simulated-auth",
      setup(builder) {
        builder.onResolve({ filter: /^@\/core\/auth\/auth-client$/ }, () => ({
          path: "auth",
          namespace: "preview",
        }));
        builder.onLoad({ filter: /.*/, namespace: "preview" }, () => ({
          contents: `export const authClient = { deleteUser: async () => { const response = await fetch('/mock-delete' + location.search, {method:'POST'}); return response.json(); } };`,
        }));
      },
    },
  ],
});
const script = result.outputFiles.find((file) => file.path.endsWith(".js"));
const css = result.outputFiles.find((file) => file.path.endsWith(".css"));
createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost:8766");
  if (url.pathname === "/preview.js") {
    response.setHeader("Content-Type", "application/javascript");
    return response.end(script.contents);
  }
  if (url.pathname === "/preview.css") {
    response.setHeader("Content-Type", "text/css");
    return response.end(css.contents);
  }
  if (url.pathname === "/mock-delete") {
    await new Promise((done) => setTimeout(done, 1800));
    response.setHeader("Content-Type", "application/json");
    const mode = url.searchParams.get("result");
    if (mode === "error")
      return response.end(
        JSON.stringify({
          error: { code: "INTERNAL_SERVER_ERROR", status: 500 },
        }),
      );
    if (mode === "expired")
      return response.end(
        JSON.stringify({ error: { code: "SESSION_EXPIRED", status: 400 } }),
      );
    return response.end(
      JSON.stringify({ data: { success: true, message: "User deleted" } }),
    );
  }
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  if (url.pathname === "/login")
    return response.end(
      "<!doctype html><html lang='pt-BR'><title>Login de teste</title><h1>Login — retorno após exclusão simulada</h1></html>",
    );
  response.end(
    `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Teste isolado de exclusão</title><link rel="stylesheet" href="/preview.css"></head><body style="padding:32px;font-family:system-ui"><h1>Teste isolado do modal</h1><p>Nenhuma conta real é excluída nesta página.</p><nav><a href="/">Sucesso</a> · <a href="/?result=error">Simular erro</a> · <a href="/?result=expired">Sessão antiga</a></nav><div id="root"></div><script src="/preview.js"></script></body></html>`,
  );
}).listen(8766, "127.0.0.1", () =>
  console.log("UI preview: http://127.0.0.1:8766"),
);
