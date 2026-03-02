package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/joho/godotenv"
)

// App struct (para injeção de dependência)
type App struct {
	DB         *sql.DB
	MasterKey  string
}

func main() {
	// Carrega o .env para desenvolvimento local. Em produção, isso não fará nada.
	_ = godotenv.Load()

	// --- Configuração ---
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001" // Porta padrão
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL deve ser definida")
	}

	masterKey := os.Getenv("MASTER_KEY")
	if masterKey == "" {
		log.Fatal("MASTER_KEY deve ser definida")
	}

	// --- Conexão com o Banco ---
	db, err := connectDB(databaseURL)
	if err != nil {
		log.Fatalf("Não foi possível conectar ao banco de dados: %v", err)
	}
	defer db.Close()

	app := &App{
		DB:         db,
		MasterKey:  masterKey,
	}

	// --- Rotas da API ---
	mux := http.NewServeMux()
	mux.HandleFunc("/health", app.healthHandler)

	// Endpoint público para validar uma chave
	mux.HandleFunc("/validate", app.validateKeyHandler)

	// Endpoints de "admin" para criar/gerenciar chaves
	// Eles são protegidos pelo middleware de autenticação
	mux.Handle("/admin/keys", app.masterKeyAuthMiddleware(http.HandlerFunc(app.createKeyHandler)))

	log.Printf("Serviço de Autenticação (Go) rodando na porta %s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

// connectDB inicializa e tenta a conexão com o PostgreSQL com retentativas
func connectDB(databaseURL string) (*sql.DB, error) {
	var db *sql.DB
	var err error

	for i := 1; i <= 5; i++ {
		db, err = sql.Open("pgx", databaseURL)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conectado ao PostgreSQL com sucesso!")
				return db, nil
			}
		}

		log.Printf("Tentativa %d: Falha ao conectar ao banco de dados (%v). Tentando novamente em 5 segundos...", i, err)
		if db != nil {
			db.Close()
		}
		time.Sleep(5 * time.Second)
	}

	return nil, fmt.Errorf("após 5 tentativas, não foi possível conectar ao banco de dados: %v", err)
}