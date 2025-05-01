# backend

## ビジネスロジックソース変更場所
アプリのビジネスロジックソースは下記にある。(ビジネスロジック以外のソースはアプリ基盤のため、基本変更しないように、変更必要な場合は指示確認)
  例：retailビジネスロジックのソース
- backend/src/main/java/com/youlai/boot/modules/retail
- backend/src/main/resources/mapper/retail
- backend/src/test/java/com/youlai/boot/modules/retail


## front
## APIの受信 
- You can @ files here
- APIの受信  
フロント側画面でAPIレスポンスを受信して、画面上にデータ設定するとき、
dataという構造はなしように
 例：
res.data.list → res.list に変更
res.data.total → res.total に変更