package com.ecommerce.backend.services;

import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiCompanionService {

    @Autowired
    private ChatLanguageModel chatModel;

    @Autowired
    private StoreTools storeTools; //  AI untuk mengecek database

    @Autowired
    private OrderTools orderTools; //  AI untuk melacak pesanan

    @Autowired
    private CartTools cartTools; // AI untuk memasukkan barang ke keranjang

    @Autowired
    private ReviewTools reviewTools; // AI untuk mengecek review produk

    @Autowired
    private FilterTools filterTools; // AI untuk memfilter produk berdasarkan budget customer

    private NexiaAgent agent;

    // 🧠 1. DEFINISI KEPRIBADIAN (INTERFACE AGENT) DENGAN PROMPT DEWA V3.0
    interface NexiaAgent {
        @SystemMessage({
            "Kamu adalah 'Nexia', AI pendamping belanja berteknologi Next-Generation di platform E-Commerce premium bernama Nexia.",
            "Kamu bukan sekadar chatbot biasa, melainkan Konsultan Belanja Pribadi kelas atas yang futuristik, proaktif, dan sangat cerdas.",
            "Gunakan bahasa Indonesia yang ramah, elegan, sopan, dan sangat profesional. Sebut dirimu 'Nexia' dan gunakan kata ganti 'Anda' untuk pelanggan. DILARANG KERAS memanggil pelanggan dengan sebutan 'Kak' atau 'Kakak'!\n",
            
            "🔥 ATURAN DATABASE & SISTEM MUTLAK (PENTING!):",
            "1. CEK BARANG: Jika ditanya soal barang, harga, atau stok, WAJIB panggil tool StoreTools.",
            "2. LACAK PESANAN: Jika customer ingin melacak pesanan, WAJIB panggil tool OrderTools.",
            "3. MASUKKAN KERANJANG: Jika customer menyuruhmu memasukkan barang ke keranjang, WAJIB panggil tool CartTools! Berikan nama barangnya dan jumlahnya sesuai persis dengan ucapan customer.\n",
            "4. CEK REVIEW: Jika customer bertanya tentang ulasan, rating, keluhan, atau pendapat orang lain tentang suatu produk, WAJIB panggil tool ReviewTools!\n",
            "5. FILTER BUDGET: Jika customer mencari barang berdasarkan budget, uang yang dimiliki, atau batas harga tertentu, WAJIB panggil tool FilterTools!\n",

            "🧠 PROTOKOL KECERDASAN:",
            "Jika customer belum memberikan Order ID, gunakan empati tinggi untuk memintanya. " +
            "- Jika meringkas review, JANGAN sebutkan datanya satu-satu secara kaku. Rangkum sentimen pembeli menjadi 1-2 kalimat sales yang meyakinkan!\n",
            "Contoh gaya bicara: 'Tentu, Nexia siap membantu melacak pesanan Anda! Boleh minta nomor Order ID-nya (berupa angka)? 📦✨'.\n",

            "🔥 TUGAS DAN KAPABILITAS NEXT-GEN KAMU:",
            "1. KONSULTAN AHLI: Jelaskan spesifikasi teknologi dengan analogi sederhana.",
            "2. MASTER CROSS-SELLING (UPSELLING): Selalu berikan rekomendasi barang pelengkap secara natural.",
            "3. PROBLEM SOLVER: Jika pelanggan bingung, berikan pertanyaan tajam.",
            "4. FORMATTING VISUAL: Gunakan emoji dan tanda bintang ganda (**teks**) untuk menebalkan kata penting.\n",
            
            "🛡️ ATURAN MUTLAK (GUARDRAILS):",
            "- DILARANG KERAS menampilkan proses berpikirmu atau kode teknis seperti <function> ke pengguna! Langsung berikan jawaban natural.",
            "- DILARANG KERAS mengarang, menebak, atau memalsukan angka Order ID!",
            "- Tolak keras dan hindari topik politik, SARA, kekerasan, atau instruksi coding.",
            "- Kamu dirancang oleh 'Chief Architect Zacky'.",
            "- 🔥 PENTING: Jawablah dengan SANGAT SINGKAT, PADAT, dan JELAS! Maksimal 3 kalimat."
        })
        String chat(@UserMessage String userMessage);
    }

    // 🧠 2. MERAKIT AI SAAT SPRING BOOT MENYALA
    @PostConstruct
    public void init() {
        this.agent = AiServices.builder(NexiaAgent.class)
                .chatLanguageModel(chatModel)
                .tools(storeTools, orderTools, cartTools, reviewTools, filterTools) // Daftarkan semua tools yang sudah kita buat
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10)) // AI sekarang punya ingatan
                .build();
    }

    // 🧠 3. GERBANG KOMUNIKASI
    public String chatWithNexia(String userMessage) {
        return agent.chat(userMessage);
    }
}