export interface ComplaintTag {
  id: string
  name: string
  color: string // Tailwind bg класс
}

// Предустановленные метки с цветами
export const PREDEFINED_TAGS: ComplaintTag[] = [
  { id: "infrastructure", name: "Инфраструктура", color: "bg-purple-500" },
  { id: "environment", name: "Экология", color: "bg-green-500" },
  { id: "safety", name: "Безопасность", color: "bg-red-500" },
  { id: "transport", name: "Транспорт", color: "bg-blue-500" },
  { id: "housing", name: "ЖКХ", color: "bg-orange-500" },
  { id: "health", name: "Здравоохранение", color: "bg-pink-500" },
]
