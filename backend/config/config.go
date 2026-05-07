package config

import (
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"reading-reflection/models"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Config struct {
	ServerPort    string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	JWTSecret     string
	ZhipuAPIKey   string
	ZhipuModel    string
	UploadsPath   string
}

var AppConfig Config
var DB *gorm.DB

func GetJWTSecret() string {
	return AppConfig.JWTSecret
}

func GetDB() *gorm.DB {
	return DB
}

func GetZhipuAPIKey() string {
	return AppConfig.ZhipuAPIKey
}

func GetUploadsPath() string {
	return AppConfig.UploadsPath
}

func LoadConfig() {
	exePath, _ := os.Executable()
	exeDir := filepath.Dir(exePath)
	
possiblePaths := []string{
		"backend/.env",
		filepath.Join(exeDir, "backend", ".env"),
		filepath.Join(exeDir, ".env"),
		".env",
	}
	
	var loadedPath string
	for _, path := range possiblePaths {
		if _, err := os.Stat(path); err == nil {
			if err := godotenv.Load(path); err == nil {
				loadedPath = path
				log.Printf("✅ 成功加载配置文件: %s", loadedPath)
				break
			}
		}
	}
	
	if loadedPath == "" {
		log.Println("⚠️  未找到 .env 文件，使用默认配置")
	}

	AppConfig = Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "3306"),
		DBUser:      getEnv("DB_USER", "root"),
		DBPassword:  getEnv("DB_PASSWORD", ""),
		DBName:      getEnv("DB_NAME", "reading_reflection"),
		JWTSecret:   getEnv("JWT_SECRET", "your-jwt-secret-key"),
		ZhipuAPIKey: getEnv("ZHIPU_API_KEY", ""),
		ZhipuModel:  getEnv("ZHIPU_MODEL", "glm-4-flash"),
	}
	// 计算 uploads 目录的绝对路径（不依赖工作目录）
	AppConfig.UploadsPath = resolveUploadsPath(exePath)

	log.Printf("✅ 配置加载完成，DB=%s:%s/%s, Uploads=%s", AppConfig.DBHost, AppConfig.DBPort, AppConfig.DBName, AppConfig.UploadsPath)
}

func resolveUploadsPath(exePath string) string {
	if p := os.Getenv("UPLOADS_PATH"); p != "" {
		return p
	}
	exeDir := filepath.Dir(exePath)
	candidate := filepath.Join(exeDir, "uploads")
	if info, err := os.Stat(candidate); err == nil && info.IsDir() {
		return candidate
	}
	// 从 backend/ 目录运行 go run 时，exe 在临时目录，回退到 cwd
	cwd, _ := os.Getwd()
	cwdCandidate := filepath.Join(cwd, "uploads")
	if info, err := os.Stat(cwdCandidate); err == nil && info.IsDir() {
		return cwdCandidate
	}
	return "./uploads"
}

func ValidateStartup() error {
	if AppConfig.DBPassword == "" {
		log.Println("⚠️  数据库密码为空，请检查 .env 配置")
	}
	if AppConfig.JWTSecret == "your-jwt-secret-key" {
		log.Println("⚠️  使用默认 JWT 密钥，建议在生产环境中修改")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func InitDB() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		AppConfig.DBUser,
		AppConfig.DBPassword,
		AppConfig.DBHost,
		AppConfig.DBPort,
		AppConfig.DBName,
	)

	var err error

	log.Println("🔄 尝试连接数据库...")
	maxRetries := 5
	retryDelay := 2 * time.Second

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			log.Printf("⏳ 第 %d/%d 次重试，等待 %d 秒...", i+1, maxRetries, retryDelay/time.Second)
			time.Sleep(retryDelay)
		}

		if AppConfig.DBPort == "3307" || AppConfig.DBHost == "127.0.0.1" || AppConfig.DBHost == "localhost" {
			log.Printf("🔍 检测 SSH 隧道本地端口 %s 是否可用...", AppConfig.DBPort)
			address := net.JoinHostPort(AppConfig.DBHost, AppConfig.DBPort)
			conn, err := net.DialTimeout("tcp", address, 2*time.Second)
			if err != nil {
				log.Printf("⚠️  端口 %s 不可用: %v", AppConfig.DBPort, err)
				if i < maxRetries-1 {
					log.Println("💡 请检查 SSH 隧道是否已建立: ssh -f -N -L 3307:127.0.0.1:3306 root@linyubo.top")
				}
				continue
			}
			conn.Close()
			log.Printf("✅ 端口 %s 可用", AppConfig.DBPort)
		}

		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("✅ 数据库连接成功")
			break
		}

		log.Printf("❌ 第 %d/%d 次连接失败: %v", i+1, maxRetries, err)
		if i == maxRetries-1 {
			log.Fatal("🔴 数据库连接重试次数耗尽，启动失败")
		}
	}

	log.Println("🔍 检查并执行数据库迁移...")
	if DB != nil {
		migrateV5()
		// migrateV6()
		migrateV7()
		// AutoMigrate()
		log.Println("⚠️  已跳过自动迁移，直接启动服务")
	} else {
		log.Println("⚠️  数据库未连接，跳过迁移")
	}

	log.Println("⏭️  启动完成")
}

func migrateV5() {
	var columnExists bool
	DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = ? AND table_name = 'books' AND column_name = 'epub_file_path'", AppConfig.DBName).Scan(&columnExists)
	
	if !columnExists {
		log.Println("📝 添加 epub_file_path 字段到 books 表...")
		if err := DB.Exec("ALTER TABLE books ADD COLUMN epub_file_path VARCHAR(512) DEFAULT NULL COMMENT 'EPUB 文件存储路径'").Error; err != nil {
			log.Printf("⚠️  添加字段失败（可能已存在）: %v", err)
		} else {
			log.Println("✅ 成功添加 epub_file_path 字段")
		}
	} else {
		log.Println("✅ epub_file_path 字段已存在，跳过迁移")
	}
}

func migrateV6() {
	var columnNull string
	DB.Raw("SELECT IS_NULLABLE FROM information_schema.columns WHERE table_schema = ? AND table_name = 'questions' AND column_name = 'chapter_id'", AppConfig.DBName).Scan(&columnNull)
	if columnNull == "NO" {
		DB.Exec("ALTER TABLE questions MODIFY COLUMN chapter_id CHAR(36) NULL")
		log.Println("✅ questions.chapter_id 已设为可空")
	} else {
		log.Println("✅ questions.chapter_id 已经是可空，跳过")
	}
}

func AutoMigrate() {
	log.Println("🔄 开始自动迁移数据库表结构...")

	if err := DB.AutoMigrate(
		&models.User{},
		&models.Book{},
		&models.Chapter{},
		&models.Question{},
		&models.Settings{},
		&models.PracticeRecord{},
		&models.PromptTemplate{},
		&models.Paragraph{},
		&models.Concept{},
		&models.ConceptPracticeRecord{},
		&models.Annotation{},
		&models.ParaphraseRecord{},
		&models.TokenBlacklist{},
		&models.PasswordResetToken{},
	); err != nil {
		log.Fatal("❌ 数据库迁移失败:", err)
	}

	log.Println("✅ 数据库表结构迁移完成")
}

func migrateV7() {
	// 添加 users 表的新列
	type ColumnCheck struct {
		Name  string
		Type  string
		Table string
	}
	checks := []ColumnCheck{
		{"login_attempts", "INT DEFAULT 0", "users"},
		{"locked_until", "DATETIME NULL", "users"},
		{"recovery_phrase", "VARCHAR(255) DEFAULT ''", "users"},
	}

	for _, check := range checks {
		var count int64
		DB.Raw(
			"SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?",
			AppConfig.DBName, check.Table, check.Name,
		).Scan(&count)

		if count == 0 {
			log.Printf("📝 添加 %s.%s 字段...", check.Table, check.Name)
			if err := DB.Exec("ALTER TABLE " + check.Table + " ADD COLUMN " + check.Name + " " + check.Type).Error; err != nil {
				log.Printf("⚠️  添加 %s 字段失败: %v", check.Name, err)
			} else {
				log.Printf("✅ 成功添加 %s 字段", check.Name)
			}
		} else {
			log.Printf("✅ %s 字段已存在，跳过", check.Name)
		}
	}

	// 创建 token_blacklists 表
	if !DB.Migrator().HasTable(&models.TokenBlacklist{}) {
		log.Println("📝 创建 token_blacklists 表...")
		if err := DB.AutoMigrate(&models.TokenBlacklist{}); err != nil {
			log.Printf("⚠️  创建 token_blacklists 表失败: %v", err)
		} else {
			log.Println("✅ token_blacklists 表创建成功")
		}
	} else {
		log.Println("✅ token_blacklists 表已存在，跳过")
	}

	// 创建 password_reset_tokens 表
	if !DB.Migrator().HasTable(&models.PasswordResetToken{}) {
		log.Println("📝 创建 password_reset_tokens 表...")
		if err := DB.AutoMigrate(&models.PasswordResetToken{}); err != nil {
			log.Printf("⚠️  创建 password_reset_tokens 表失败: %v", err)
		} else {
			log.Println("✅ password_reset_tokens 表创建成功")
		}
	} else {
		log.Println("✅ password_reset_tokens 表已存在，跳过")
	}
}
