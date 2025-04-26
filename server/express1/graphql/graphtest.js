const express=require("express")
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const graphRouter=express.Router()
// graphRouter.get("/chart_data",(req,res)=>{
//   res.send(JSON.stringify(TestMesObjData.TestMesObjData))
// })

// 使用 GraphQL schema language 构建 schema
// querry是查询，mutation是修改,query是入口，必须有，
  // foo可有可无
const schema = buildSchema(`
  type Article {
    id:ID!
    title:String!
    content:String!
  }
  type Query {
    hello: String
    ly:String
    user: user
    articles:[Article]
    article(id:ID!):Article
  }

  type Mutation{
    addArticle(title:String!,content:String!):Article
    updateArticle(id:ID!,title:String!,content:String!):Article
    deleteArticle(id:ID!):Article
  }
  type subject{
    name:String!
    score:Int
  }
  type user{
    name:String
    age:Int
    hobbies:[String]
    score:[subject]
  }
`);
// 约束，加了！表示不能为空，也就是下面的root里必须有值
// hobbies:[String!]!表示数组和数组里面的元素都不能为空

// 查询示例{
//   ly
//   user { //对于多层数据，必须写清楚里面层级需要的字段
//     name
//     hobbies //字符串数组，可以直接写字段名
//     score{ //对象数组，需要写字段名，以及里面需要的字段
//       name
//     }
//   }
// }

const articles=[
  {id:"1",title:"title1",content:"content1"},
  {id:"2",title:"title2",content:"content2"},
  {id:"3",title:"title3",content:"content3"},
]  

const root = {
  hello: () => 'Hello world!',
  ly:()=> "ly is me",
  user:()=>({name:"lyn",age:18,hobbies:["swimming","running"],
    score:[{name:"math",score:100},{name:"english",score:90}] //因为name定义了！表示不能为空
  }),
  articles:()=>articles,
  article:({id})=>articles.find(article=>article.id===id),
  // 使用示例 article(id:"2"){
  //   title
  //   content
  // }
  addArticle:({title,content})=>{
    // add使用示例：mutation{
    //   addArticle(title:"title4",content:"content4"){
    //     id
    //     title
    //     content
    //   }
    const article={id:articles.length+1,title,content}
    articles.push(article)
    console.log(articles);
    return article
  },
  updateArticle:({id,title,content})=>{
    // update使用示例：mutation{
    //   updateArticle(id:"2",title:"title2",content:"content2"){
    //     id
    //     title
    //     content
    //   }
    const article=articles.find(article=>article.id===id)
    if(title) article.title=title
    if(content) article.content=content
    return article
  },
  deleteArticle:({id})=>{
    // delete使用示例：mutation{
    //   deleteArticle(id:"2"){
    //     id
    //     title
    //     content
    //   }
    const index=articles.findIndex(article=>article.id===id)
    const article=articles[index]
    articles.splice(index,1)
    return article
  }
};

graphRouter.use('/client', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // 开启 GraphiQL IDE
}));
graphRouter.use('/ly', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false
}));

module.exports= graphRouter