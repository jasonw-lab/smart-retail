# backend

## API新規作成
API新規作成時、ビジネスロジックソース及びテストソースを作成してください。
ビジネスロジックソースは下記にある。
(ビジネスロジック以外のソースはアプリ基盤のため、基本変更しないように、変更必要な場合は指示確認)

### 例：代表的なビジネスロジックのソース
- backend/src/main/java/com/youlai/boot/modules/retail
  - controller
  - converter(entity,form,voの変換)
  - mapper
  - model
    - entity
    - form　（更新、追加APIのリクエストパラメータ）
    - query (検索APIのリクエストパラメータ)
    - vo　（検索時のレスポンスパラメータ）
  - service 
  - service/impl

- backend/src/main/resources/mapper/retail (mapperファイル)
- backend/src/test/java/com/youlai/boot/modules/retail
  (テストソース)
　参考：[ProductControllerRestAssuredTest.java](backend/src/test/java/com/youlai/boot/modules/retail/controller/ProductControllerRestAssuredTest.java)

### 参考ソース
ユーザー管理機能のビジネスロジックソース
- [UserPageQuery.java](backend/src/main/java/com/youlai/boot/system/model/query/UserPageQuery.java)
- [User.java](backend/src/main/java/com/youlai/boot/system/model/entity/User.java)
- [UserForm.java](backend/src/main/java/com/youlai/boot/system/model/form/UserForm.java)
- [User.java](backend/src/main/java/com/youlai/boot/system/model/entity/User.java)
- [UserServiceImpl.java](backend/src/main/java/com/youlai/boot/system/service/impl/UserServiceImpl.java)
- [UserService.java](backend/src/main/java/com/youlai/boot/system/service/UserService.java)
- [UserMapper.java](backend/src/main/java/com/youlai/boot/system/mapper/UserMapper.java)
- [UserController.java](backend/src/main/java/com/youlai/boot/system/controller/UserController.java)
- [UserConverter.java](backend/src/main/java/com/youlai/boot/system/converter/UserConverter.java)


## API変更時
API変更時、関連のビジネスロジックソース及びテストソースを変更してください。


## その他
- ソースファイル修正時は上書きでお願いします。
- controllerファイルを作成したら、テストコードも作成してください。

# front
## APIの受信 
- You can @ files here
- APIの受信  
フロント側画面でAPIレスポンスを受信して、画面上にデータ設定するとき、
dataという構造はなしように
 例：
res.data.list → res.list に変更
res.data.total → res.total に変更