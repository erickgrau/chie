"use client"

import * as React from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
    role: "user" | "assistant"
    content: string
}

export function ChatBox() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        { role: "assistant", content: "Hi! I'm Chie AI. Ask me anything about your finances." }
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        // Capture current page text content for context
        const pageContext = document.body.innerText

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    context: pageContext
                })
            })

            if (!response.ok) throw new Error("Failed to send message")

            const data = await response.json()
            setMessages(prev => [...prev, { role: "assistant", content: data.message }])
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="bg-card border border-border rounded-lg shadow-xl w-[350px] sm:w-[400px] flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-sm">Chie Assistant</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-start gap-3 text-sm",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}
                                >
                                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div
                                    className={cn(
                                        "rounded-lg px-3 py-2 max-w-[80%]",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs ml-11">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-background flex gap-2">
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                            placeholder="Ask about this page..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-8 w-8 shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    )
}
