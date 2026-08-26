// Motor de acesso do comprador: gerar senha, montar e disparar o e-mail.
//
// Vivia dentro de api/kirvano/route.ts e só o webhook alcançava. O painel do
// admin precisa exatamente do mesmo e-mail (para presentear alguém ou para
// socorrer quem não recebeu), então virou lib compartilhada. O webhook e o
// painel mandam o MESMO e-mail — mudou aqui, mudou nos dois.

export type EmailAcesso =
  | { tipo: "nova-conta"; senha: string }
  | { tipo: "recompra" };

// Senha legível ditada por telefone: sem 0/O/1/l/I.
export function gerarSenha(): string {
  const letras = "abcdefghijkmnopqrstuvwxyz";
  const numeros = "23456789";
  const b = new Uint32Array(10);
  crypto.getRandomValues(b);
  return (
    [...Array(6)].map((_, i) => letras[b[i] % letras.length]).join("") +
    [...Array(4)].map((_, i) => numeros[b[6 + i] % numeros.length]).join("")
  );
}

export async function enviarEmailAcesso(
  nome: string,
  email: string,
  acesso: EmailAcesso
) {
  // Mesma blindagem do painel: link de e-mail nunca pode sair apontando para
  // um endereço de desenvolvimento.
  const url = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://www.metaforasterapeuticas.video";
  const primeiro = (nome || "").trim().split(" ")[0] || "tudo bem";

  const blocoCredenciais =
    acesso.tipo === "nova-conta"
      ? `
  <div style="background:#ffffff;border:1px solid #e6dccd;border-radius:12px;padding:22px;margin:0 0 28px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7358;margin:0 0 4px">E-mail</p>
    <p style="font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 18px">${email}</p>
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7358;margin:0 0 4px">Senha</p>
    <p style="font-size:22px;font-weight:700;letter-spacing:2px;color:#6f5b45;font-family:ui-monospace,Menlo,monospace;margin:0">${acesso.senha}</p>
  </div>`
      : `
  <div style="background:#ffffff;border:1px solid #e6dccd;border-radius:12px;padding:22px;margin:0 0 28px">
    <p style="font-size:15px;line-height:1.6;color:#1a1a1a;margin:0">
      Sua conta já existia, então seu acesso foi reativado — entre com o
      e-mail <strong style="color:#6f5b45">${email}</strong> e a senha que você já usava.
      Se não lembrar, use "Esqueci minha senha" na tela de login.
    </p>
  </div>`;

  const html = `
<div style="background:#f4efe8;padding:40px 16px">
  <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
    <img src="${url}/logo-metaforas-bronze.png" alt="Metáforas Terapêuticas" width="210" style="display:block;margin:0 auto 28px" />
    <div style="height:1px;background:#a78b71;opacity:0.5;margin:0 0 32px"></div>
    <p style="font-size:16px;color:#8a7358;margin:0 0 20px">Oi, ${primeiro}.</p>
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.45;color:#1a1a1a;margin:0 0 26px">
      Seu acesso à biblioteca de metáforas está liberado.
    </p>
    ${blocoCredenciais}
    <a href="${url}/login" style="display:inline-block;background:#a78b71;color:#0a0a0a;text-decoration:none;padding:15px 32px;border-radius:10px;font-size:16px;font-weight:700">
      Entrar na biblioteca
    </a>
    <p style="font-size:14px;color:#7a7268;line-height:1.6;margin:32px 0 0">
      Guarde este e-mail. Precisando de ajuda, é só responder.
    </p>
    <div style="height:1px;background:#e0d5c5;margin:32px 0 0"></div>
    <p style="font-size:12px;color:#9a9186;margin:16px 0 0">Metáforas Terapêuticas · metaforasterapeuticas.video</p>
  </div>
</div>`.trim();

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Seu acesso à biblioteca de metáforas",
      html,
    }),
  });
  if (!resposta.ok) {
    throw new Error(`Resend ${resposta.status}: ${await resposta.text()}`);
  }
}
