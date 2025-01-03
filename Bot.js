// bắt sự kiện fetch cho mỗi yêu cầu
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// đây là mảng chứa token hợp lệ
const authorizedTokens = ["token1", "token2", "token3"];

// hàm xử lý khi bắt được sự kiện
async function handleRequest(request) {
  // nếu request tới cloudflare workers không phải phương thức POST
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // lấy dữ liệu từ key "authorization" gửi lên từ header shortcut
  const authorizationHeader = request.headers.get("authorization");

  // nếu dữ liệu authorization gửi lên khớp với authorizedTokens ở trên
  if (authorizedTokens.includes(authorizationHeader)) {
    try {
      // lấy dữ liệu từ body
      const data = await request.json();
      // gửi thông báo về Telegram
      const note =
        data.note == "No"
          ? ""
          : `
  
  Ghi chú: ${data.note}`;
      const status = await sendPhotoTelegram(
        data.thumbnail,
        `${data.dealOption}${note}
  
  Danh mục: ${data.category}
  
  Liên kết tải về: [${data.name}](${data.url})
  
  Tham gia cùng chúng tôi và chia sẻ những ứng dụng trên App Store bằng liên kết phía dưới..
        
  💬 Group: [Share2Get Chat](https://t.me/Share2Get)
  🔔 Channel: [Share2Get Channel](https://t.me/Share2Gets)`
      );

      // xuất ra kết quả
      return new Response(JSON.stringify(status));
    } catch (e) {
      // nếu có lỗi trong quá trình gửi thông báo
      return new Response(
        JSON.stringify({
          ok: 3,
          error_msg: e,
        })
      );
    }
  } else {
    // nếu dữ liệu authorization gửi lên không khớp với authorizedTokens ở trên
    return new Response(
      JSON.stringify({
        ok: 401,
        error_msg: "Token invalid",
      })
    );
  }
}

// hàm sendPhoto tới Telegram
async function sendPhotoTelegram(photo, text) {
  let chat_id = "@chatid"; // chatid của kênh hoặc nhóm hoặc user muốn nhận tin nhắn
  let key = "bot token"; // bot token
  const response = await fetch(`https://api.telegram.org/bot${key}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parse_mode: "Markdown",
      chat_id: chat_id,
      caption: text,
      photo: photo,
    }),
  });
  if (!response.ok) {
    return {
      ok: 0,
      error_msg: response.statusText,
    };
  } else {
    return {
      ok: 1,
    };
  }
}
