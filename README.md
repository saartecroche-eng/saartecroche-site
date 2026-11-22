# Catálogo Sá Arte Crochê (GitHub Pages)

Site 100% estático: só HTML, CSS e JavaScript. Sem servidor, sem banco de dados, sem build.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. Normalmente não precisa mexer. |
| `style.css` | Visual (cores da marca no topo do arquivo, em `:root`). |
| `produtos.js` | **Todos os dados**: modelos, preços, cores e caminhos das fotos. É o arquivo que você edita. |
| `app.js` | Monta a vitrine, o filtro, a escolha de cores e o link do WhatsApp. Não precisa mexer. |
| `imagens/` | Todas as fotos (veja abaixo). |

## Como organizar a pasta `/imagens`

```
imagens/
  sem-foto.svg                  <- aparece quando alguma foto não for encontrada
  capas/
    antonella.webp              <- foto de capa de cada modelo (nome = id)
    aurora.webp
  extras/
    carmen-preta.webp           <- fotos de cores avulsas (modelos com poucas cores)
  antonella/
    cores/
      verde-militar.webp        <- uma foto por cor (só modelos com lista de cores)
      cru.webp
  aurora/
    cores/
      mostarda.webp
```

Regras de nome para não dar erro:
1. O nome do arquivo da cor é o nome da cor sem acento e com hífen: "Verde sálvia" vira `verde-salvia.webp`.
2. Use sempre a mesma extensão em todo o site (recomendo `.webp`; `.jpg` também serve).
3. Maiúsculas importam no GitHub Pages: `Cru.webp` e `cru.webp` são arquivos diferentes. Use só minúsculas.

### Tamanho das fotos (importante para o celular)
- Largura de 800 px, proporção 3:4 (retrato).
- Peso entre 50 e 120 KB por foto. As fotos originais de 2 a 3 MB precisam ser reduzidas antes de subir.
- Para reduzir sem instalar nada: abra https://squoosh.app, arraste a foto, escolha WebP, qualidade 75 e largura 800.
- Com 40 modelos e 50 cores cada, serão cerca de 2.000 fotos. Em 80 KB cada, dá uns 160 MB, abaixo do limite recomendado do GitHub Pages (1 GB). Como as fotos das cores só carregam quando o cliente clica, o site continua leve.

## Como adicionar um modelo novo

1. Coloque a capa em `imagens/capas/nome-do-modelo.webp` e, se houver cores, crie `imagens/nome-do-modelo/cores/`.
2. Abra `produtos.js`, copie um bloco `{ ... }` inteiro, cole depois da vírgula do último e troque os dados:
   - `id`: igual ao nome da pasta.
   - `categoria`: aparece como botão de filtro no topo (novas categorias aparecem sozinhas).
   - `preco`: só o número (`267`). Use `0` para "Valor sob consulta".
   - `cores`: uma linha por cor, com `nome`, `hex` (cor da bolinha) e `imagem`.
3. A `imagem` da cor é opcional. Se a foto ainda não existe, a bolinha funciona e mostra a foto principal.
4. Cuidado com as vírgulas: cada cor e cada modelo termina com vírgula, menos o último.

## Como trocar o número do WhatsApp

No topo do `produtos.js`, em `CONFIG.whatsapp`: `55` + DDD + número, só dígitos. Exemplo: `5519999999999`.
A mensagem gerada é: "Olá! Gostaria de encomendar a bolsa Antonella na cor Verde militar."

## Como publicar no GitHub Pages

1. Crie uma conta em https://github.com e um repositório novo chamado, por exemplo, `catalogo` (público).
2. Envie todos os arquivos desta pasta (`index.html`, `style.css`, `produtos.js`, `app.js` e a pasta `imagens`) arrastando para o repositório pela opção "Add file > Upload files". Quando a pasta de fotos ficar grande, use o aplicativo GitHub Desktop.
3. No repositório, vá em Settings > Pages, em "Branch" escolha `main` e a pasta `/ (root)`, e salve.
4. Em 1 a 2 minutos o site abre em `https://SEU-USUARIO.github.io/catalogo/`.
5. Para usar seu próprio domínio, preencha o campo "Custom domain" na mesma tela e aponte o domínio no seu provedor. O GitHub mostra as instruções.

## Para testar no seu computador
Dê dois cliques no `index.html`. Se alguma foto não aparecer, confira o nome da pasta e do arquivo (minúsculas, sem acento).

## Como o site fica leve
- Todas as fotos da vitrine usam `loading="lazy"` (só carregam quando aparecem na tela).
- A foto de uma cor só é baixada quando o cliente clica na bolinha.
- Cada card mostra no máximo 8 bolinhas; as demais ficam em "+N", que abre a janela do produto com todas as cores (até 50 ou mais) em uma grade com rolagem.

## Estado atual do catálogo
- 32 modelos já cadastrados no `produtos.js`, com preço e fio, e 520 cores com foto.
- Os modelos Aurora, Amora, Antonella, Emily, Gabriela, Lua Cheia, Mariana, Oreo, Paula, Pochete Bia, Susan e Tati têm a lista completa de cores.
- Carmen, Lunic e Carteira Leque têm as poucas cores que já têm foto. Os demais modelos aparecem com "Cores sob consulta" até você enviar as variações.
- Falta cadastrar: Clutch Leque e Bolsa Varjão (ainda sem foto), e as dimensões de cada bolsa (campo `dimensoes`, opcional).
- A cor da bolinha (`hex`) é aproximada. Se alguma ficar diferente da foto, troque o código no `produtos.js`.
- A foto principal de cada modelo é a do portfólio. Para trocar, substitua o arquivo `imagens/capas/<modelo>.webp`.
