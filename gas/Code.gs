/**
 * AI Web Course LP - お問い合わせフォーム連携用スクリプト
 * 
 * 【設定手順】
 * 1. Googleスプレッドシートを新規作成します。
 * 2. シートの1行目にヘッダー項目を入力します（A1: タイムスタンプ, B1: 名前, C1: メールアドレス, D1: 種別, E1: 備考）。
 * 3. メニュー「拡張機能」>「Apps Script」を開き、このコードを貼り付けます。
 * 4. 「デプロイ」>「新しいデプロイ」を選択。
 * 5. 種類の選択で「ウェブアプリ」を選びます。
 * 6. 以下の設定でデプロイします：
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 * 7. 発行された「ウェブアプリのURL」をコピーし、LPの `js/main.js` 内の `GAS_URL` に貼り付けます。
 */

function doPost(e) {
  // CORS設定（クロスドメイン通信を許可）
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // プリフライトリクエスト(OPTIONS)対応
    if (e.postData === undefined) {
      return createJsonResponse({ status: "ok" }, headers);
    }

    // 送信されたJSONデータをパース
    const data = JSON.parse(e.postData.contents);
    
    // スプレッドシートを取得
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 現在の日時を取得
    const timestamp = new Date();
    
    // シートに追記するデータの配列を作成 (HTMLフォームのname属性と対応させる)
    const rowData = [
      timestamp,
      data.name || "",
      data.email || "",
      data.type || "",
      data.message || ""
    ];
    
    // 最終行にデータを追加
    sheet.appendRow(rowData);
    
    // 成功レスポンスを返す
    return createJsonResponse({ status: "success", message: "Data saved successfully" }, headers);
    
  } catch (error) {
    // エラー時のレスポンス
    return createJsonResponse({ status: "error", message: error.toString() }, headers, 500);
  }
}

// OPTIONSリクエスト用（CORSプリフライト通信の許可）
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return createJsonResponse({ status: "ok" }, headers);
}

// HTTPレスポンスを生成するヘルパー関数
function createJsonResponse(responseData, headers, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
  
  // ContentServiceでは直接Headerを操作できないため、
  // 実運用でCORSエラーが出る場合はデプロイ設定を「全員（匿名ユーザーを含む）」にしているか再確認してください。
  return output;
}
