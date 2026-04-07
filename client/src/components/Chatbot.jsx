import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const TRANSPORT_EMOJIS = { train: '🚂', flight: '✈️', bus: '🚌', taxi: '🚕' }

const GREET = `Hi! I'm TravelBot 🤖\nI can help you compare your options. Ask me:\n• "Which is cheapest?"\n• "What's the fastest?"\n• "Most eco-friendly?"\n• "Which has the best AI score?"`

function generateResponse(input, results, from, to) {
  if (!results || results.length === 0) {
    return "I don't have any results to analyse yet. Please run a search first!"
  }

  const q = input.toLowerCase()

  const cheapest = results.reduce((a, b) => (a.price < b.price ? a : b))
  const fastest = results.reduce((a, b) => (a.duration < b.duration ? a : b))
  const greenest = results.reduce((a, b) => (a.co2 < b.co2 ? a : b))
  const bestScore = results.reduce((a, b) => (a.aiScore > b.aiScore ? a : b))

  const fmt = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
  }

  if (/cheap|budget|afford|low.?cost|price|money|cost/.test(q)) {
    return `💰 Cheapest option: **${cheapest.company}** (${cheapest.type}) at ₹${cheapest.price.toLocaleString('en-IN')}.\nThat's ${((1 - cheapest.price / Math.max(...results.map(r => r.price))) * 100).toFixed(0)}% cheaper than the most expensive option!`
  }

  if (/fast|quick|speed|time|duration|quick/.test(q)) {
    return `⚡ Fastest option: **${fastest.company}** (${fastest.type}) — only ${fmt(fastest.duration)} travel time.`
  }

  if (/eco|green|carbon|co2|env|sustain|pollut/.test(q)) {
    return `🌿 Most eco-friendly: **${greenest.company}** (${greenest.type}) with just ${greenest.co2} kg CO₂.\nThat's the cleanest way to travel from ${from} to ${to}.`
  }

  if (/best|score|ai|recommend|suggest/.test(q)) {
    return `🏆 Highest AI score: **${bestScore.company}** (${bestScore.type}) — ${bestScore.aiScore}% overall.\nThis accounts for price, time, comfort, and eco-impact.`
  }

  if (/train/.test(q)) {
    const t = results.find(r => r.type === 'train')
    return t ? `🚂 Train option: **${t.company}** — ₹${t.price.toLocaleString('en-IN')}, ${fmt(t.duration)}, AI score ${t.aiScore}%.` : "No train data available for this route."
  }

  if (/flight|plane|air/.test(q)) {
    const t = results.find(r => r.type === 'flight')
    return t ? `✈️ Flight option: **${t.company}** — ₹${t.price.toLocaleString('en-IN')}, ${fmt(t.duration)}, AI score ${t.aiScore}%.` : "No flight data available for this route."
  }

  if (/bus|coach/.test(q)) {
    const t = results.find(r => r.type === 'bus')
    return t ? `🚌 Bus option: **${t.company}** — ₹${t.price.toLocaleString('en-IN')}, ${fmt(t.duration)}, AI score ${t.aiScore}%.` : "No bus data available for this route."
  }

  if (/taxi|cab|ola|uber|car/.test(q)) {
    const t = results.find(r => r.type === 'taxi')
    return t ? `🚕 Taxi option: **${t.company}** — ₹${t.price.toLocaleString('en-IN')}, ${fmt(t.duration)}, AI score ${t.aiScore}%.` : "No taxi data available for this route."
  }

  if (/option|choice|all|list|show/.test(q)) {
    return results.map(r =>
      `${TRANSPORT_EMOJIS[r.type] || '🚌'} **${r.company}** — ₹${r.price.toLocaleString('en-IN')} · ${fmt(r.duration)} · ${r.aiScore}%`
    ).join('\n')
  }

  if (/hello|hi|hey|help/.test(q)) {
    return GREET
  }

  return `I'm not sure about that, but I can tell you:\n• Cheapest: **${cheapest.company}** at ₹${cheapest.price.toLocaleString('en-IN')}\n• Fastest: **${fastest.company}** (${fmt(fastest.duration)})\n• Best AI score: **${bestScore.company}** (${bestScore.aiScore}%)\n\nTry asking "cheapest", "fastest", or "most eco-friendly"!`
}

function MessageBubble({ msg }) {
  const isUser = msg.sender === 'user'
  const lines = msg.text.split('\n')
  return (
    <div className={isUser ? 'chat-msg-user' : 'chat-msg-bot'}>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
            {i < lines.length - 1 && <br />}
          </span>
        )
      })}
    </div>
  )
}

export default function Chatbot({ results, from, to }) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ sender: 'bot', text: GREET }])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = { sender: 'user', text }
    const botMsg = { sender: 'bot', text: generateResponse(text, results, from, to) }
    setMessages(m => [...m, userMsg, botMsg])
    setInput('')
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span>TravelBot</span>
              <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Online</span>
            </div>
            <button
              className="btn btn-link text-white p-0 fw-800"
              style={{ fontSize: '1.1rem', lineHeight: 1 }}
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Ask about cheapest, fastest…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{ borderRadius: '20px' }}
            />
            <button
              className="btn btn-gradient btn-sm fw-700"
              onClick={send}
              style={{ borderRadius: '20px', minWidth: 48 }}
              disabled={!input.trim()}
            >
              <i className="bi bi-send" />
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-fab"
        onClick={() => setOpen(o => !o)}
        title="Open TravelBot"
        aria-label="Open TravelBot chat"
      >
        <span style={{ fontSize: open ? '1.2rem' : '1.5rem' }}>
          {open ? '✕' : '🤖'}
        </span>
      </button>
    </>
  )
}
