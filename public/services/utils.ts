import { Tag } from "@fider/models"
import { Fider } from "."

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const classSet = (input?: any): string => {
  let classes = ""
  if (input) {
    for (const key in input) {
      if (key && !!input[key]) {
        classes += ` ${key}`
      }
    }
    return classes.trim()
  }
  return ""
}

type DateFormat = "full" | "short" | "date"
type DateOptsMap = {
  [key in DateFormat]: Intl.DateTimeFormatOptions
}

const dateOpts: DateOptsMap = {
  date: { day: "numeric", month: "short", year: "numeric" },
  short: { month: "short", year: "numeric" },
  full: { day: "2-digit", month: "long", year: "numeric", hour: "numeric", minute: "numeric" },
}

export const formatDate = (locale: string, input: Date | string, format: DateFormat = "full"): string => {
  const date = input instanceof Date ? input : new Date(input)

  try {
    return new Intl.DateTimeFormat(locale, dateOpts[format]).format(date)
  } catch {
    return date.toLocaleString(locale)
  }
}

export const timeSince = (locale: string, now: Date, date: Date, dateFormat: DateFormat = "short"): string => {
  try {
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
    const minutes = Math.round(seconds / 60)
    const hours = Math.round(minutes / 60)
    const days = Math.round(hours / 24)
    const months = Math.round(days / 30)
    const years = Math.round(days / 365)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    return (
      (seconds < 60 && rtf.format(-1 * seconds, "seconds")) ||
      (minutes < 60 && rtf.format(-1 * minutes, "minutes")) ||
      (hours < 24 && rtf.format(-1 * hours, "hours")) ||
      (days < 30 && rtf.format(-1 * days, "days")) ||
      (days < 365 && rtf.format(-1 * months, "months")) ||
      rtf.format(-1 * years, "years")
    )
  } catch {
    return formatDate(locale, date, dateFormat)
  }
}
export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener(
      "load",
      () => {
        const parts = (reader.result as string).split("base64,")
        resolve(parts[1])
      },
      false
    )

    reader.addEventListener(
      "error",
      () => {
        reject(reader.error)
      },
      false
    )

    reader.readAsDataURL(file)
  })
}

export const timeAgo = (date: string | Date): number => {
  const d = date instanceof Date ? date : new Date(date)
  return (new Date().getTime() - d.getTime()) / 1000
}

export const isCookieEnabled = (): boolean => {
  try {
    document.cookie = "cookietest=1"
    const ret = document.cookie.indexOf("cookietest=") !== -1
    document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT"
    return ret
  } catch (e) {
    return false
  }
}

export const uploadedImageURL = (bkey: string | undefined, size?: number): string | undefined => {
  if (bkey) {
    if (size) {
      return `${Fider.settings.assetsURL}/static/images/${bkey}?size=${size}`
    }
    return `${Fider.settings.assetsURL}/static/images/${bkey}`
  }
  return undefined
}

export const truncate = (input: string, maxLength: number): string => {
  if (input && input.length > maxLength) {
    return `${input.substr(0, maxLength)}...`
  }
  return input
}

export type StringObject<T = any> = {
  [key: string]: T
}

export const copyToClipboard = (text: string): Promise<void> => {
  if (window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText) {
    return window.navigator.clipboard.writeText(text)
  }
  return Promise.reject(new Error("Clipboard API not available"))
}

export const clearUrlHash = (replace?: boolean) => {
  const oldURL = window.location.href
  const newURL = window.location.pathname + window.location.search
  if (replace) {
    window.history.replaceState("", document.title, newURL)
  } else {
    window.history.pushState("", document.title, newURL)
  }
  // Trigger event manually
  const hashChangeEvent = new HashChangeEvent("hashchange", {
    oldURL,
    newURL,
    cancelable: true,
    bubbles: true,
    composed: false,
  })
  if (!window.dispatchEvent(hashChangeEvent)) {
    // Event got cancelled
    window.history.replaceState("", document.title, oldURL)
  }
}

// Helper function to sort tags by 'isPublic' status and then by name
export const sortTags = (tags: Tag[]) => {
  return tags.sort((a, b) => {
    // First compare by 'isPublic' status (false comes before true)
    if (a.isPublic !== b.isPublic) {
      return a.isPublic ? 1 : -1
    }

    // If 'isPublic' status is the same, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
}
