import { PaginatedData } from "../types"
import { StatItem } from "../types/complaint-stats.type"

// Преобразуем данные для Chart
export function transformChartData(data: StatItem[], period: string) {
  if (!data) return []

  return data.map((item) => {
    // Для отображения на графике преобразуем ключи в более читаемый формат
    let displayKey = item.key

    if (period === "day") {
      const date = new Date(item.key)
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      displayKey = `${day}.${month}`
    } else if (period === "week") {
      // Преобразуем неделю в формат "Неделя 49"
      const weekMatch = item.key.match(/W(\d+)/)
      if (weekMatch) {
        displayKey = `Неделя ${weekMatch[1]}`
      }
    } else if (period === "month") {
      // Преобразуем месяц в формат "Декабрь"
      const [year, monthNum] = item.key.split("-")
      const date = new Date(parseInt(year), parseInt(monthNum) - 1)
      displayKey = date.toLocaleString("ru", { month: "long" })
    }

    return {
      ...item,
      displayKey,
      complaints: item.value,
    }
  })
}

export function getTotalComplaints(data: PaginatedData<StatItem>) {
  return data.data.reduce((sum, item) => sum + item.value, 0)
}

// Получаем описание периода
export function getPeriodDescription(period: string) {
  switch (period) {
    case "day":
      return "Последние дни"
    case "week":
      return "Последние недели"
    case "month":
      return "Последние месяцы"
    default:
      return ""
  }
}

// Получаем название оси X
export function getXAxisLabel(period: string) {
  switch (period) {
    case "day":
      return "Дни"
    case "week":
      return "Недели"
    case "month":
      return "Месяцы"
    default:
      return ""
  }
}
