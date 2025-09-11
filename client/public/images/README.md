
# Configuração de Imagens Locais

## Como adicionar imagens:

### Para adicionar imagem de ator:
1. Coloque a imagem na pasta `/client/public/images/actors/`
2. Nomeie como: `nome-do-ator.jpg` (exemplo: `jared-padalecki.jpg`)
3. Adicione no `image-config.json` em "actors": `"jared-padalecki": "/images/actors/jared-padalecki.jpg"`

### Para adicionar imagem de diretor:
1. Coloque a imagem na pasta `/client/public/images/directors/`
2. Nomeie como: `nome-do-diretor.jpg`
3. Adicione no `image-config.json` em "directors"

### Para adicionar banner (imagem de fundo):
1. Coloque a imagem na pasta `/client/public/images/banners/`
2. Nomeie como: `titulo-do-conteudo-banner.jpg` (exemplo: `supernatural-banner.jpg`)
3. Adicione no `image-config.json` em "banners": `"sobrenatural": "/images/banners/supernatural-banner.jpg"`

### Para adicionar poster:
1. Coloque a imagem na pasta `/client/public/images/posters/`
2. Nomeie como: `titulo-do-conteudo-poster.jpg`
3. Adicione no `image-config.json` em "posters"

## Exemplo para Supernatural:

Para adicionar as imagens do Supernatural:

1. **Banner**: Coloque em `/client/public/images/banners/supernatural-banner.jpg`
2. **Poster**: Coloque em `/client/public/images/posters/supernatural-poster.jpg`
3. **Atores**: 
   - `/client/public/images/actors/jared-padalecki.jpg`
   - `/client/public/images/actors/jensen-ackles.jpg`
   - `/client/public/images/actors/misha-collins.jpg`

As imagens serão carregadas automaticamente quando estiverem nos locais corretos.
