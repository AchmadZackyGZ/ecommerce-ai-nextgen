import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  AlertCircle,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { generateMeta } from "~/utils/seo";
import { toast } from "sonner";
import { apiClient } from "~/services/apiClient";

export const meta = () =>
  generateMeta("Keuangan Toko", "Kelola saldo dan penarikan dana toko Anda.");

export default function SellerFinance() {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [heldBalance, setHeldBalance] = useState<number>(0); // 🔥 STATE BARU UNTUK SALDO TERTENTU
  const [transactions, setTransactions] = useState<any[]>([]);

  // Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const bankOptions = [
    { id: "bca", name: "BCA" },
    { id: "mandiri", name: "Bank Mandiri" },
    { id: "bni", name: "BNI" },
    { id: "bri", name: "BRI" },
  ];

  // 🔥 FETCH DATA DINAMIS DARI DATABASE
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/finance/shop");
        setBalance(res.data.data.balance);
        setHeldBalance(res.data.data.heldBalance); // Ambil saldo escrow
        setTransactions(res.data.data.transactions);
      } catch (error) {
        toast.error("Gagal memuat data keuangan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount.replace(/\D/g, ""));

    if (!amountNum || amountNum < 50000)
      return toast.error("Minimal penarikan Rp 50.000");
    if (amountNum > balance) return toast.error("Saldo tidak mencukupi!");
    if (!selectedBank) return toast.error("Pilih bank tujuan penarikan!");

    try {
      setIsWithdrawing(true);
      // await apiClient.post("/finance/withdraw", { amount: amountNum, bank: selectedBank });
      toast.success("Permintaan penarikan dana berhasil diproses!");
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
    } catch (error) {
      toast.error("Gagal melakukan penarikan dana.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
          <Wallet className="text-cyan-400" /> Keuangan Toko
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Pantau penghasilan dan tarik saldo toko Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI: KARTU SALDO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl transition-all group-hover:bg-cyan-500/20"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <TrendingUp size={18} className="text-emerald-400" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Total Saldo Aktif
                </span>
              </div>

              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-6 tracking-tight">
                Rp {balance.toLocaleString("id-ID")}
              </h2>

              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={20} /> Tarik Saldo
              </button>
            </div>
          </div>

          {/* 🔥 UI BARU: KARTU SALDO TERTAHAN (ESCROW) */}
          <div className="flex items-center justify-between bg-zinc-900/40 p-5 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <span className="text-sm font-bold text-zinc-300">
                Saldo Tertahan (Escrow)
              </span>
            </div>
            <span className="text-lg font-black text-yellow-500">
              Rp {heldBalance.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="rounded-3xl border border-white/5 bg-black/20 p-6">
            <div className="flex items-start gap-3 text-sm text-zinc-400">
              <AlertCircle
                size={20}
                className="text-cyan-500 shrink-0 mt-0.5"
              />
              <p>
                Saldo otomatis bertambah setelah pembeli mengkonfirmasi{" "}
                <b>Pesanan Diterima</b>. Nexia mengenakan biaya layanan sebesar{" "}
                <b>1%</b> dari setiap transaksi yang berhasil.
              </p>
            </div>
          </div>
        </div>

        {/* KANAN: BUKU MUTASI TRANSAKSI */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 md:p-8 h-full backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <History className="text-purple-400" size={22} />
              <h3 className="text-lg font-bold text-white">
                Riwayat Transaksi
              </h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                  Belum ada riwayat transaksi.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/30 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${tx.type === "EARNING" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {tx.type === "EARNING" ? (
                          <ArrowDownLeft size={24} />
                        ) : (
                          <ArrowUpRight size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white line-clamp-1">
                          {tx.description}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p
                        className={`text-base font-black ${tx.type === "EARNING" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {tx.type === "EARNING" ? "+" : "-"} Rp{" "}
                        {tx.amount.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
                        {tx.type === "EARNING" ? "Dana Masuk" : "Penarikan"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TARIK DANA */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          {/* ... SISA KODE MODAL TETAP SAMA ... */}
          <div className="w-full max-w-md rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Building className="text-cyan-400" /> Tarik Saldo
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Nominal Penarikan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) =>
                      setWithdrawAmount(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="0"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-2xl font-black text-cyan-400 focus:border-cyan-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-zinc-500">
                    Minimal Rp 50.000
                  </span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(balance.toString())}
                    className="text-xs font-bold text-cyan-500 hover:text-cyan-400"
                  >
                    Tarik Semua
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-3">
                  Bank Tujuan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {bankOptions.map((bank) => (
                    <label
                      key={bank.id}
                      className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 transition-all ${selectedBank === bank.id ? "border-cyan-400 bg-cyan-500/10 text-cyan-400" : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/30 hover:text-white"}`}
                    >
                      <input
                        type="radio"
                        name="bank"
                        value={bank.id}
                        className="sr-only"
                        checked={selectedBank === bank.id}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      />
                      <span className="font-bold text-sm">{bank.name}</span>
                      {selectedBank === bank.id && (
                        <CheckCircle
                          size={14}
                          className="absolute top-2 right-2"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || !withdrawAmount || !selectedBank}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                {isWithdrawing ? "Memproses..." : "Tarik Sekarang"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
