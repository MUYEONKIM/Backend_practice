import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { DataSource } from "typeorm";
import { Board } from "./table/Board";

// api-docs부분
const typeDefs = `#graphql
  type Query {
    hello: String
    babo: String
  }

  type Mutation {
    createBoard: String
  }
`;

// api부분 만들기
const resolvers = {
  Query: {
    hello: () => "world",
    babo: () => "바보바보",
  },
  Mutation: {
    createBoard: () => "asdf를 뚠뚠치치몽치!",
  },
};

// @ts-ignore
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const AppDataSource = new DataSource({
  type: "mysql", // 어떤 db 쓸건지
  host: "127.0.0.1", // host번호
  port: 3306, // 포트번호
  username: "root",
  password: "wjsdmsgml1!",
  database: "backendmysql", // 스키마 만들었을시 스키마 이름임!!!
  entities: [Board],
  synchronize: true, // 동기화 하는걸 허락해줘
  logging: true, // 우리의 명령어가 어떻게 sql명령어로 바뀌는지 추적
});

AppDataSource.initialize()
  .then(() => {
    console.log("DB접속에 성공했습니다");
    startStandaloneServer(server).then(() => {
      console.log("그래프큐엘 서버가 실행되었습니다!!"); // 포트: localhost:4000으로 실행이 됨
    });
  })
  .catch((error) => {
    console.log("실패했습니다", error);
  });
// 이렇게 db연결이 되면 api가 실행되게 해야함
