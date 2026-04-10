"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { currency, formatDate } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { FinancialTransaction } from "@/types/domain";

export function FinanceOverview() {
  const { transactions, addTransaction, searchQuery, preferences, addFinanceCategory } = useAppState();
  const { user } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("2026-04-10");
  const [description, setDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const filteredTransactions = transactions.filter(
    (transaction: FinancialTransaction) =>
      !searchQuery.trim() ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentMonth = "2026-04";
  const previousMonth = "2026-03";
  const currentBalance = transactions
    .filter((transaction) => transaction.date.startsWith(currentMonth))
    .reduce((total, item) => total + (item.type === "income" ? item.amount : -item.amount), 0);
  const previousBalance = transactions
    .filter((transaction) => transaction.date.startsWith(previousMonth))
    .reduce((total, item) => total + (item.type === "income" ? item.amount : -item.amount), 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Fluxo financeiro direto, sem transformar o módulo em um sistema contábil."
        eyebrow="Módulo"
        title="Financeiro"
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-text-soft">Saldo</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(income - expense)}</p>
          </div>
          <div>
            <p className="text-sm text-text-soft">Entradas</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(income)}</p>
          </div>
          <div>
            <p className="text-sm text-text-soft">Saídas</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(expense)}</p>
          </div>
          <div>
            <p className="text-sm text-text-soft">Vs. período anterior</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
              {currency(currentBalance - previousBalance)}
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <Select onChange={(event) => setType(event.target.value as "income" | "expense")} value={type}>
            <option value="income">Entrada</option>
            <option value="expense">Saída</option>
          </Select>
          <Input onChange={(event) => setAmount(event.target.value)} placeholder="Valor" type="number" value={amount} />
          <Select onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="">Categoria</option>
            {preferences.financeCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          <Input onChange={(event) => setDescription(event.target.value)} placeholder="Descrição opcional" value={description} />
          <div className="flex gap-2">
            <Input
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Nova categoria"
              value={newCategory}
            />
            <Button
              onClick={() => {
                if (!newCategory.trim()) return;
                addFinanceCategory(newCategory);
                setNewCategory("");
              }}
              variant="secondary"
            >
              Salvar
            </Button>
          </div>
          <Button
            onClick={() => {
              addTransaction({
                userId: user?.id ?? "demo-user",
                type,
                amount: Number(amount),
                category,
                date,
                description
              });
            }}
          >
            Registrar
          </Button>
        </Card>
      </div>

      <div className="grid gap-3">
        {filteredTransactions.length ? (
          filteredTransactions.map((transaction) => (
            <Card className="flex items-center justify-between gap-4" key={transaction.id}>
              <div>
                <p className="font-medium">{transaction.category}</p>
                <p className="mt-1 text-sm text-text-soft">
                  {transaction.description ?? "Sem descrição"} • {formatDate(transaction.date)}
                </p>
              </div>
              <p className={transaction.type === "income" ? "text-success" : "text-danger"}>
                {transaction.type === "income" ? "+" : "-"} {currency(transaction.amount)}
              </p>
            </Card>
          ))
        ) : (
          <EmptyState
            description="Seus lançamentos aparecerão aqui assim que você registrar entradas ou saídas."
            title="Financeiro zerado"
          />
        )}
      </div>
    </div>
  );
}
