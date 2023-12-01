import { ApolloServer, ApolloServerOptions } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { DataSource } from "typeorm";
import { Board } from "./table/Board";

// api-docs부분
const typeDefs = `#graphql
  # 인자로 들어가는 type은 type이 아니라 input으로 해주어야 함
  input CreateBoardInput {
    writer: String!
    title: String!
    contents: String!
  }

  input UpdateBoardInput {
    id: String!
    writer: String!
    title: String!
    contents: String!
  }

  type MyBoard {
    id: String
    writer: String
    title: String
    contents: String
    isDeleted: Boolean
  }

  type Query {
    fetchBoards: [MyBoard]
  }

  type Mutation {
    # 연습용(example방식)
    # createBoard(writer: String, title: String, contents: String): String!
    
    # 실무용(practice방식) - 객체를 만들어서 보기좋게 지정
    createBoard(createBoardInput: CreateBoardInput!): String!
    updateBoard(updateBoardInput: UpdateBoardInput!): String!
    deleteBoard(id: String): String!
  }
`;

// api 만들기
const resolvers = {
  Query: {
    fetchBoards: async (_, args) => {
      // 조건 달려면 find 안에 { where: {상세조건}}, 한개만 찾기는 findone
      // 1. 모두 꺼내기
      // const result = await Board.find( where: { isDelete: false})
      // console.log(result)

      // 2. 한 개만 꺼내기
      // const result = await Board.findOne({
      //   where: { id: "ccc26ad1-be1e-481a-9ae6-bd2811106e1c" },
      // });

      const result = await Board.find({ where: { isDeleted: false } });
      console.log(args);
      console.log(result);

      return result;
    },
  },

  Mutation: {
    // 브라우저에서 요청이 오면 args에 인자가 들어오고
    // api 끼리 호출 하게 되면 parent에 들어오게 된다, 즉 api안에서 api를 요청하면 그 안에 들어간다는 듯
    // request, response 예를들어 헤더 같은 정보들이 context에 들어옴
    // context.request.headers
    // createBoard: async (parent: any, args: any, context: any, info: any) => {
    // createBoard: async (args: any) => {
    createBoard: async (_: any, args: any) => {
      await Board.insert({
        //   // 앞의 인자가 같으니 스프레드 연산자로 줄이기
        ...args.createBoardInput,

        //   // 하나씩 지정했을 때
        //   // writer: args.createBoardInput.writer,
        //   // title: args.createBoardInput.title,
        //   // contents: args.createBoardInput.contents,
      });

      // createBoard안에서 다른 api불러오기
      // fetchBoard("철수") 여기에서의 철수가 fetchBoard의 parent인자에 들어가게 되는것임

      return "게시글 등록에 성공했어요";
    },

    updateBoard: async (_: any, args: any) => {
      // // 3번 게시글을 영희로 바꿔줘!
      // // update는 왼쪽 조건, 오른쪽 수정할 것
      await Board.update(
        { id: args.updateBoardInput.id },
        { ...args.updateBoardInput }
      );
      return "게시글 수정에 성공했어요";
    },

    deleteBoard: async (_: any, args: any) => {
      // 방법1 - 완전삭제
      // await Board.delete({ id: 3 }); // 3번 게시글 삭제해줘!
      // 방법2 - soft delete - 단점 : 삭제가 언제 된지 모름
      // await Board.update({ id: 3 }, { isDeleted: true }); // 3번 게시글 삭제했다 치는 방법! 왜냐하면 실제로 삭제했다가 나중에 복구가 힘들기 때문에
      // 방법3 - soft delete이후 삭제한 날짜 기입해주기
      await Board.update({ id: args.id }, { isDeleted: true }); // deletedAt이 초기값이 Null 이면? 삭제 안된거, new Date() 들어가 있으면 삭제된 것
      //위와 같은 방식으로 업데이트 한 이후 .find 에서 찾을때 where: {isDelete: false} 이렇게로 fetchBoard를 함
      return "게시글 삭제에 성공했어요";
    },
  },
};

// @ts-ignore
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true,

  // 선택한 사이트만 풀어주고 싶을때
  // cors: {
  // origin: ["http://naver.com", "http://coupang.com"]
  // }
} as ApolloServerOptions<any>);

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
