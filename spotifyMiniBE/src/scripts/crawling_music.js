 

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const songs = [
  // Sơn Tùng M-TP
  {
    query: "Chúng Ta Của Tương Lai Sơn Tùng MTP",
    file: "son-tung-01",
  },
  {
    query: "Muộn Rồi Mà Sao Còn Sơn Tùng MTP",
    file: "son-tung-02",
  },
  {
    query: "Chạy Ngay Đi Sơn Tùng MTP",
    file: "son-tung-03",
  },
  {
    query: "Nơi Này Có Anh Sơn Tùng MTP",
    file: "son-tung-04",
  },
  {
    query: "Lạc Trôi Sơn Tùng MTP",
    file: "son-tung-05",
  },

  // MONO
  {
    query: "Waiting For You MONO",
    file: "mono-01",
  },
  {
    query: "Em Là MONO",
    file: "mono-02",
  },
  {
    query: "Anh Không Thể MONO",
    file: "mono-03",
  },
  {
    query: "Quên Anh Đi MONO",
    file: "mono-04",
  },
  {
    query: "Open Your Eyes MONO",
    file: "mono-05",
  },

  // HIEUTHUHAI
  {
    query: "Không Thể Say HIEUTHUHAI",
    file: "hieuthuhai-01",
  },
  {
    query: "Ngủ Một Mình HIEUTHUHAI",
    file: "hieuthuhai-02",
  },
  {
    query: "Exit Sign HIEUTHUHAI",
    file: "hieuthuhai-03",
  },
  {
    query: "Vệ Tinh HIEUTHUHAI",
    file: "hieuthuhai-04",
  },
  {
    query: "Dynamic Duo HIEUTHUHAI",
    file: "hieuthuhai-05",
  },

  // tlinh
  {
    query: "Nếu Lúc Đó tlinh",
    file: "tlinh-01",
  },
  {
    query: "Gái Độc Thân tlinh",
    file: "tlinh-02",
  },
  {
    query: "Thích Quá Rùi Nà tlinh",
    file: "tlinh-03",
  },
  {
    query: "Ghệ Iu Dấu Của Em Ơi tlinh",
    file: "tlinh-04",
  },
  {
    query: "vaicaunoicokhiennguoithaydoi tlinh",
    file: "tlinh-05",
  },

  // Đen
  {
    query: "Mang Tiền Về Cho Mẹ Đen Vâu",
    file: "den-01",
  },
  {
    query: "Đi Về Nhà Đen Vâu",
    file: "den-02",
  },
  {
    query: "Lối Nhỏ Đen Vâu",
    file: "den-03",
  },
  {
    query: "Hai Triệu Năm Đen Vâu",
    file: "den-04",
  },
  {
    query: "Bài Này Chill Phết Đen Vâu",
    file: "den-05",
  },

  // Vũ.
  {
    query: "Bước Qua Nhau Vũ",
    file: "vu-01",
  },
  {
    query: "Lạ Lùng Vũ",
    file: "vu-02",
  },
  {
    query: "Đông Kiếm Em Vũ",
    file: "vu-03",
  },
  {
    query: "Mùa Hè Của Em Vũ",
    file: "vu-04",
  },
  {
    query: "Chuyện Những Người Yêu Xa Vũ",
    file: "vu-05",
  },

  // Hoàng Dũng
  {
    query: "Nàng Thơ Hoàng Dũng",
    file: "hoang-dung-01",
  },
  {
    query: "Đôi Lời Hoàng Dũng",
    file: "hoang-dung-02",
  },
  {
    query: "Chờ Anh Nhé Hoàng Dũng",
    file: "hoang-dung-03",
  },
  {
    query: "Yếu Đuối Hoàng Dũng",
    file: "hoang-dung-04",
  },
  {
    query: "Thói Quen Hoàng Dũng",
    file: "hoang-dung-05",
  },

  // Mỹ Tâm
  {
    query: "Đúng Cũng Thành Sai Mỹ Tâm",
    file: "my-tam-01",
  },
  {
    query: "Người Hãy Quên Em Đi Mỹ Tâm",
    file: "my-tam-02",
  },
  {
    query: "Đừng Hỏi Em Mỹ Tâm",
    file: "my-tam-03",
  },
  {
    query: "Ước Gì Mỹ Tâm",
    file: "my-tam-04",
  },
  {
    query: "Họa Mi Tóc Nâu Mỹ Tâm",
    file: "my-tam-05",
  },

  // Soobin
  {
    query: "Phía Sau Một Cô Gái Soobin",
    file: "soobin-01",
  },
  {
    query: "BlackJack Soobin",
    file: "soobin-02",
  },
  {
    query: "Tháng Năm Soobin",
    file: "soobin-03",
  },
  {
    query: "Đi Để Trở Về Soobin",
    file: "soobin-04",
  },
  {
    query: "Nếu Ngày Ấy Soobin",
    file: "soobin-05",
  },

  // Bích Phương
  {
    query: "Bùa Yêu Bích Phương",
    file: "bich-phuong-01",
  },
  {
    query: "Đi Đu Đưa Đi Bích Phương",
    file: "bich-phuong-02",
  },
  {
    query: "Bao Giờ Lấy Chồng Bích Phương",
    file: "bich-phuong-03",
  },
  {
    query: "Gửi Anh Xa Nhớ Bích Phương",
    file: "bich-phuong-04",
  },
  {
    query: "Một Cú Lừa Bích Phương",
    file: "bich-phuong-05",
  },
];

async function downloadSong(song, index) {
  return new Promise((resolve) => {
    const outputPath = path.join(
      uploadDir,
      `${song.file}.%(ext)s`
    );

    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "ytsearch1:${song.query}"`;

    console.log(`\n[${index + 1}/${songs.length}] Downloading: ${song.query}`);

    exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`❌ Failed: ${song.file}`);
        console.log("ERROR:", error.message);
        console.log("STDERR:", stderr);
    } else {
        console.log(`✅ Done: ${song.file}.mp3`);
    }

    resolve();
    });
  });
}

async function start() {
  console.log("🎵 START CRAWLING MUSIC...\n");

  for (let i = 0; i < songs.length; i++) {
    await downloadSong(songs[i], i);
  }

  console.log("\n🔥 ALL DOWNLOAD COMPLETED");
}

start();