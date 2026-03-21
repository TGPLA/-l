package models

import (
	"github.com/google/uuid"
)

func 生成UUID() string {
	return uuid.New().String()
}
