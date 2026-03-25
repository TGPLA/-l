package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"reading-reflection/models"

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
}

var AppConfig Config
var DB *gorm.DB

func GetJWTSecret() string {
	return AppConfig.JWTSecret
}

func GetDB() *gorm.DB {
	return DB
}

func GetZhipuAPIKey(userKey string) string {
	if userKey != "" {
		return userKey
	}
	if AppConfig.ZhipuAPIKey != "" {
		return AppConfig.ZhipuAPIKey
	}
	return ""
}

func LoadConfig() {
	exePath, _ := os.Executable()
	envPath := filepath.Join(filepath.Dir(exePath), "backend", ".env")
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		envPath = "backend/.env"
	}
	
	if err := godotenv.Load(envPath); err != nil {
		log.Printf("⚠️  加载环境变量文件失败: %v，尝试从当前目录加载", err)
		godotenv.Load()
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
	log.Printf("✅ 配置加载完成，ZhipuAPIKey=%s", AppConfig.ZhipuAPIKey)
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
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ 数据库连接失败:", err)
	}
	log.Println("✅ 数据库连接成功")

	AutoMigrate()
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
	); err != nil {
		log.Fatal("❌ 数据库迁移失败:", err)
	}

	log.Println("✅ 数据库表结构迁移完成")
}
