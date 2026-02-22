---
title: "Descomplicando Database Design"
description: "Modelagem de banco de dados não precisa ser um bixo de 7 cabeças. Muitos devs erram nessa parte, que é uma das mais cruciais para o bom funcionamento do sistema."
date: 2026-02-21
---

## TL;DR

- Modelagem de dados deve começar independente da tecnologia a ser usada; comece pelo levantamento de requisitos e evite amarrar o modelo a um banco específico.
- Divida o processo em três fases: conceitual (entidades e relacionamentos), lógica (atributos e chaves) e física (implementação com tipos e índices apropriados).
- Antecipe mudanças de requisitos usando técnicas como DDD e, na modelagem física, pense em padrões de acesso para definir índices que garantam escalabilidade.

Fazer uma modelagem correta pode ajudar a diminuir gargalos no seu sistema, quando tiver
muito leitura e escrita no banco de dados. Deixar pra depois é contrair dívida técnica.

Com esse post, você conseguirá aprender os fundamentos da modelagem de banco de dados para usar em seus projetos.

## A modelagem deve ser feita de forma independente do banco de dados

Nesse primeiro momento da modelagem, não faz sentido já começar a pensar em usar alguma tecnologia referente ao banco de dados, como: MySQL, PostgreSQL, Oracle, MongoDB, etc. Se você já começa com esse pensamento, você fica enviesado a modelar de acordo com o banco de dados escolhido e isso se torna um problema por gerar uma dependência da modelagem ao banco de dados. E se futuramente o banco de dados precisar ser alterado por algum motivo? Dessa forma toda a modelagem feita fica comprometida e precisará ser refeita.

Vale ressaltar que antes de começar o processo de modelagem, é necessário fazer o levantamento de requisitos referentes ao projeto. Esses requisitos servirão como um guia para a definição de entidades e seus relacionamentos.

## Existem 3 tipos de modelagem

### Modelo conceitual

É a etapa onde definimos as entidades e como elas se relacionam (1:1, 1:N, N:N). Nesse estágio, os principais elementos são entidades, atributos e os relacionamentos entre eles.

O objetivo é capturar os requisitos e conceitos do negócio de uma forma compreensível, com uma representação não muito técnica, de fácil entendimento entre todas as partes interessadas.

Dica: Se não é um projeto pra uma empresa grande ou há poucas partes não técnicas envolvidas, você pode e deve pular essa etapa e começar diretamente pelo Modelo Lógico para economizar tempo da modelagem.

![Modelo Conceitual](../../../assets/images/posts/01/1.webp)
_Modelo Conceitual — Crédito da imagem: Igor Nascimento Alves_

### Modelo Lógico

É a etapa onde definimos os atributos (dados) das nossas entidades, incluindo as nossas chaves primárias e estrangeiras. Nessa etapa, o modelo lógico traduz a modelagem conceitual em uma estrutura mais detalhada e específica.

O objetivo é criar um modelo técnico para guiar o desenvolvimento do banco de dados, mas ainda abstrato o bastante para ser independente de tecnologia.

Deixarei abaixo algumas ferramentas que podem nos auxiliar na modelagem:

- [Lucid.co](https://lucid.co/)
- [Eraser.io](https://eraser.io/)
- [Draw.io](https://draw.io/)

![Modelo Lógico](../../../assets/images/posts/01/2.webp)
_Modelo Lógico — Crédito da imagem: Igor Nascimento Alves_

### Modelo Físico

É a etapa final, onde aplicamos características do banco de dados no modelo lógico definido previamente, ou seja, é a etapa de implementação de uma tecnologia referente ao banco de dados. Aqui, definimos os tipos de dados e como serão organizados.

O objetivo é otimizar o modelo para uma tecnologia escolhida, garantindo um desempenho eficiente do banco de dados. Nessa etapa que iremos analisar qual é o melhor tipo de banco de dados que atenderá melhor o nosso projeto, seja SQL ou NoSQL.

![Modelo Físico](../../../assets/images/posts/01/3.webp)
Modelo Físico — Crédito da imagem: Igor Nascimento Alves

### Resumindo:

- A modelagem conceitual é a etapa onde definimos as entidades e como elas se relacionam (1:1, 1:N, N:N);
- A modelagem lógica é a etapa onde definimos os atributos (dados) das nossas entidades, incluindo as nossas chaves primárias e estrangeiras;
- A modelagem física é a etapa final, onde aplicamos características do banco de dados no modelo lógico definido previamente, ou seja, é a etapa de implementação de uma tecnologia referente ao banco de dados;
- A modelagem conceitual estabelece os requisitos do negócio, a modelagem lógica traduz esses requisitos em uma estrutura de dados compreensível e a modelagem física finaliza a implementação detalhada no ambiente de banco de dados específico.

## Alguns desafios que podemos enfrentar ao longo do processo de modelagem

Entre os desafios mais comuns estão as mudanças frequentes nos requisitos do projeto e a escalabilidade do banco de dados.

### Mudança de Requisitos

As mudanças nos requisitos são inevitáveis em qualquer ambiente de negócios dinâmico. À medida que as necessidades dos usuários evoluem ou novos requisitos surgem, os modelos de dados devem ser adaptados para refletir essas mudanças. Isso pode levar a desafios adicionais, como manter a consistência entre diferentes versões dos modelos e garantir que as alterações não comprometam a integridade dos dados existentes.

Para isso, técnicas do DDD (Domain Driven Design) podem nos ajudar a entender melhor essas mudanças no projeto. O DDD nos ajuda a entender as regras de negócio. Os requisito, regras e domínio do negócio são área correlatas e andam juntas durante toda a vida do projeto. Para um bom levantamento de requisitos e adaptação do mesmo ao longo do projeto, procure entender mais sobre o domínio do negócio, quem são os especialistas do domínio e como lidar com a linguagem ubíqua.

![Diagrama de Linguagens no DDD](../../../assets/images/posts/01/4.webp)
Diagrama de Linguagens no DDD

### Escalabilidade do Banco de Dados

A escalabilidade é outra consideração importante na modelagem de dados, especialmente em sistemas que lidam com grandes volumes de dados ou que precisam suportar um número crescente de usuários. Modelos de dados que não são escaláveis ​​podem levar a problemas de desempenho, tempo de resposta lento e dificuldades na manutenção do sistema.

Para isso, a partir da etapa de modelagem física, podemos e devemos pensar em Access Patterns (Padrões de Acesso) para definirmos índices em nosso banco de dados. Após uma análise de como é a frequência de consultas, podemos definir alguns padrões de acesso, como por exemplo:

- Listar todos os usuários;
- Buscar usuário por e-mail;
- Listar os pedidos de um usuário;

Através desses padrões definidos, podemos implementar índices em informações que são consultadas várias vezes em nosso banco de dados.

Os indices são estruturas auxiliares que aceleram a recuperação de dados em tabelas. Podemos fazer a analogia de um livro. Os índices são como informações presentes no sumário, que apontam para a localização de informações específicas, ao invés de de fazer com que o banco de dados vasculhe cada linha da tabela em busca daquela informação. Dessa forma, o desempenho da consulta é otimizado, reduzindo o tempo de resposta e diminuindo a carga computacional do servidor.

## Principais aprendizados

- O levantamento de requisitos deve ser feito antes da modelagem do banco de dados. Para compreender melhor os requisitos e regras de negócio do projeto, técnicas de DDD (Domain Driven Design) são bem-vindas;
- A modelagem deve ser feita de forma independente do banco de dados. Existem 3 tipos de modelagem: conceitual, lógica e física;
- Somente na modelagem física é que devemos nos preocupar com o banco de dados, seja ele do tipo SQL ou NoSQL, seja MySQL, PostgreSQL, Oracle, MongoDB, ou qualquer outro;
- A análise de Access Patterns (Padrões de Acesso) e a implementação de índices na etapa da modelagem física, pode ajudar na escalabilidade do nosso banco de dados conforme o crescimento do projeto;

Deixando claro que isso é um recorte dos meus estudos!

Todas as reflexões aqui foram feitas enquanto eu consumia esses materiais:

[Curso Database Design: modelando bancos de dados do jeito certo — JSTack](https://jstack.com.br/)

[O que é e para que serve a modelagem de dados? — Blog Alura](https://www.alura.com.br/artigos/modelagem-de-dados)

---

> Banco sem modelagem é MVP: Muita Variável Problemática. :)
