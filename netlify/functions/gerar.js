

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: { Allow: "POST", "Content-Type": "application/json" }, body: JSON.stringify({ erro: "Método não permitido" }) };
    }

    let entrada;
    try {
        entrada = JSON.parse(event.body || "null");
    } catch {
        return { statusCode: 400, body: JSON.stringify({ erro: "Envie um JSON válido." }) };
    }
    if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
        return { statusCode: 400, body: JSON.stringify({ erro: "Envie uma descrição válida." }) };
    }

    try {
        const { texto } = entrada;

        const prompt = `Você cria landing pages em português para negócios reais.
Gere uma página inicial clara, específica e pronta para ser editada a partir da descrição recebida.

Formato obrigatório:
- Responda somente com um documento HTML completo, incluindo CSS dentro de <style>
- Não use Markdown, crases, explicações, JavaScript externo, imagens externas ou emojis
- Use fontes de sistema em vez de importar fontes
- O HTML deve ser válido, sem texto de placeholder e sem dados inventados como métricas, avaliações ou logos de clientes

Direção visual:
- Escolha uma paleta discreta com uma cor de destaque. Evite roxo neon, gradientes chamativos, brilho, glassmorphism e excesso de sombras
- Prefira tipografia sans-serif, bom espaço em branco e uma grade simples
- Use bordas leves e raios consistentes. Não transforme cada bloco em card
- Respeite contraste legível e inclua estilos de foco para links e botões
- Não use travessão longo. Use frases diretas e concretas

Conteúdo e estrutura:
- Header simples com nome do negócio e até três links de navegação
- Hero com título específico, texto de até 20 palavras e uma chamada para ação
- Uma seção que explique a proposta de valor
- Uma seção com 2 ou 3 diferenciais em uma composição assimétrica, sem três cards idênticos
- Uma seção de processo, serviço ou oferta que faça sentido para o negócio
- Rodapé enxuto com uma chamada final e meios de contato somente se foram informados pelo usuário
- Não crie depoimentos, percentuais, prêmios, selos ou informações que não tenham sido fornecidos

Todo o texto deve ser natural, objetivo e específico para o negócio descrito.`;

        if (!texto || typeof texto !== "string" || !texto.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({ erro: "Descreva sua ideia antes de gerar a página." }),
            };
        }

        if (texto.length > 1200) {
            return {
                statusCode: 400,
                body: JSON.stringify({ erro: "Descrição muito longa. Tente resumir em até 1200 caracteres." }),
            };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        let resposta;
        let dados;
        try {
            resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        { role: "system", content: prompt },
                        { role: "user", content: texto },
                    ],
                }),
                signal: controller.signal,
            });
            dados = await resposta.json();
        } finally {
            clearTimeout(timeoutId);
        }

        if (!resposta.ok) {
            const mensagemGroq = dados && dados.error && dados.error.message;
            return {
                statusCode: resposta.status === 429 ? 429 : 502,
                body: JSON.stringify({
                    erro: resposta.status === 429
                        ? "Muitas gerações em pouco tempo. Aguarde um momento e tente de novo."
                        : (mensagemGroq || "O gerador está indisponível agora. Tente novamente em instantes."),
                }),
            };
        }

        const resultado = dados && dados.choices && dados.choices[0] && dados.choices[0].message
            ? dados.choices[0].message.content
            : null;

        if (!resultado) {
            return {
                statusCode: 502,
                body: JSON.stringify({ erro: "Não recebemos um rascunho válido. Tente novamente." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ resultado }),
        };
    } catch (erro) {
        const foiTimeout = erro && erro.name === "AbortError";
        return {
            statusCode: foiTimeout ? 504 : 500,
            body: JSON.stringify({
                erro: foiTimeout
                    ? "O gerador demorou demais para responder. Tente novamente."
                    : "Falha ao gerar o site. Tente novamente.",
            }),
        };
    }
};
