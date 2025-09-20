import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function SraPistesivu() {
  const [rasterPages, setRasterPages] = useState([
    { id: 1, name: "Rasti 1", targets: 0, steels: 0, participants: [] },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [newName, setNewName] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState("");
  const [activeParticipantId, setActiveParticipantId] = useState(null);

  const currentPage = rasterPages[currentPageIndex];

  const calculateScore = (hits) =>
    Math.max(
      0,
      (hits.A || 0) * 5 +
        (hits.B || 0) * 5 +
        (hits.C || 0) * 3 +
        (hits.D || 0) * 1 +
        (hits["+10"] || 0) * 10 +
        (hits["-10"] || 0) * -10 +
        (hits.OHI || 0) * -10 +
        (hits.NS || 0) * -10
    );

  const removeParticipant = (id) => {
    const np = rasterPages.map((page) => ({
      ...page,
      participants: page.participants.filter((p) => p.id !== id),
    }));
    setRasterPages(np);
  };

  const viePdf = () => {
    const doc = new jsPDF();

    rasterPages.forEach((rasti, index) => {
      if (index > 0) doc.addPage();
      const maxPisteet = (rasti.targets + rasti.steels) * 10;
      doc.setFontSize(16);
      doc.text(
        `${rasti.name} – Maksimipisteet: ${maxPisteet} (Taulut: ${rasti.targets}, Pellit: ${rasti.steels})`,
        14,
        20
      );

      const data = rasti.participants
        .map((p) => {
          const score = calculateScore(p.hits);
          const time = parseFloat(p.time) || 0;
          const hf = time > 0 ? score / time : 0;
          return { name: p.name, score, time, hf };
        })
        .sort((a, b) => b.hf - a.hf)
        .map((p) => [p.name, p.score, p.time.toFixed(2), p.hf.toFixed(2)]);

      autoTable(doc, {
        startY: 30,
        head: [["Nimi", "Pisteet", "Aika", "HF"]],
        body: data,
      });
    });

    // Yhteenveto
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Yhteenveto", 14, 20);

    const userData = {};
    const rastinVoittajaHF = {};

    // 1) paras HF / rasti + kokonaisajat
    rasterPages.forEach((r) => {
      let bestHF = 0;
      r.participants.forEach((p) => {
        const score = calculateScore(p.hits);
        const time = parseFloat(p.time) || 0;
        const hf = time > 0 ? score / time : 0;
        if (!userData[p.name]) userData[p.name] = { total: 0, totalTime: 0 };
        userData[p.name].totalTime += time;
        if (hf > bestHF) bestHF = hf;
      });
      rastinVoittajaHF[r.id] = bestHF;
    });

    // 2) pisteet suhteessa rastin voittajaan
    rasterPages.forEach((r) => {
      const maxPisteet = (r.targets + r.steels) * 10;
      r.participants.forEach((p) => {
        const score = calculateScore(p.hits);
        const time = parseFloat(p.time) || 0;
        const hf = time > 0 ? score / time : 0;
        const hfProsentti = rastinVoittajaHF[r.id] > 0 ? hf / rastinVoittajaHF[r.id] : 0;
        const pisteet = parseFloat((hfProsentti * maxPisteet).toFixed(2));
        userData[p.name].total += pisteet;
      });
    });

    // 3) taulukko
    const summaryArray = Object.entries(userData).map(([name, data]) => {
      const kokHF = data.totalTime > 0 ? data.total / data.totalTime : 0;
      return { name, total: data.total, totalTime: data.totalTime, kokHF };
    });

    const bestTotal = summaryArray.length ? Math.max(...summaryArray.map((d) => d.total)) : 0;

    const summaryData = summaryArray
      .sort((a, b) => b.total - a.total)
      .map((d, idx) => [
        `${idx + 1}.`,
        d.name,
        d.total.toFixed(2),
        d.totalTime.toFixed(2),
        d.kokHF.toFixed(2),
        bestTotal > 0 ? `${((d.total / bestTotal) * 100).toFixed(2)}%` : "0.00%",
      ]);

    autoTable(doc, {
      startY: 30,
      head: [["Sija", "Nimi", "Yht. pisteet", "Kokonaisaika", "Kokonais HF", "% (pisteistä)"]],
      body: summaryData,
    });

    doc.save("sra_tulokset.pdf");
  };

  const removeCurrentRasti = () => {
    const updated = rasterPages.filter((_, i) => i !== currentPageIndex);
    if (updated.length === 0) {
      setRasterPages([{ id: 1, name: "Rasti 1", targets: 0, steels: 0, participants: [] }]);
      setCurrentPageIndex(0);
      setMessage("Kaikki rastit poistettiin. Luotiin uusi Rasti 1.");
      setTimeout(() => setMessage(""), 3000);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    } else {
      setRasterPages(updated.map((r, i) => ({ ...r, id: i + 1 })));
      setCurrentPageIndex(0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => {
            localStorage.setItem("sra_raster_data", JSON.stringify(rasterPages));
            setMessage("Tallennettu onnistuneesti selaimeen.");
            setTimeout(() => setMessage(""), 3000);
          }}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Tallenna selaimeen
        </button>
        <button
          onClick={() => {
            const saved = localStorage.getItem("sra_raster_data");
            if (saved) {
              setRasterPages(JSON.parse(saved));
              setCurrentPageIndex(0);
            }
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Lataa tallennettu
        </button>
        {rasterPages.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setCurrentPageIndex(i)}
            className={`px-3 py-1 rounded font-semibold ${
              i === currentPageIndex
                ? "bg-red-600 text-white shadow-md"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            {r.name}
          </button>
        ))}
        <button
          onClick={() => {
            const nextId = rasterPages.length + 1;
            setRasterPages([
              ...rasterPages,
              {
                id: nextId,
                name: `Rasti ${nextId}`,
                targets: 0,
                steels: 0,
                participants:
                  rasterPages[0]?.participants.map((p) => ({
                    ...p,
                    hits: { A: 0, B: 0, C: 0, D: 0, "+10": 0, "-10": 0, OHI: 0, NS: 0 },
                    time: "",
                  })) || [],
              },
            ]);
            setCurrentPageIndex(rasterPages.length);
          }}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          + Lisää rasti
        </button>
        <button onClick={removeCurrentRasti} className="bg-red-500 text-white px-3 py-1 rounded">
          Poista rasti
        </button>
        <button type="button" onClick={viePdf} className="bg-purple-600 text-white px-3 py-1 rounded">
          Vie PDF
        </button>
      </div>

      {/* Yläosan kontrollit */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium">Taulujen määrä</label>
          <input
            type="number"
            className="border px-2 py-1 rounded w-24"
            value={currentPage.targets || 0}
            min={0}
            onChange={(e) => {
              const newPages = [...rasterPages];
              newPages[currentPageIndex] = {
                ...newPages[currentPageIndex],
                targets: parseInt(e.target.value, 10) || 0,
              };
              setRasterPages(newPages);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Peltien määrä</label>
          <input
            type="number"
            className="border px-2 py-1 rounded w-24"
            value={currentPage.steels || 0}
            min={0}
            onChange={(e) => {
              const newPages = [...rasterPages];
              newPages[currentPageIndex] = {
                ...newPages[currentPageIndex],
                steels: parseInt(e.target.value, 10) || 0,
              };
              setRasterPages(newPages);
            }}
          />
        </div>
        <div className="text-sm font-semibold pb-1">
          Maksimipisteet: {currentPage.targets * 10 + currentPage.steels * 10}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Osallistujan nimi"
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() => {
            if (newName.trim()) {
              const np = rasterPages.map((page) => ({ ...page }));
              let maxId = Math.max(0, ...rasterPages.flatMap((r) => r.participants.map((p) => p.id || 0)));
              np.forEach((page) =>
                page.participants.push({
                  id: ++maxId,
                  name: newName.trim(),
                  hits: { A: 0, B: 0, C: 0, D: 0, "+10": 0, "-10": 0, OHI: 0, NS: 0 },
                  time: "",
                })
              );
              setRasterPages(np);
              setNewName("");
            }
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Lisää osallistuja
        </button>
      </div>

      {showBanner && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
          Kaikki rastit poistettiin – uusi Rasti 1 luotu automaattisesti.
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded">{message}</div>
      )}

      {/* Taulukko */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nimi</th>
            {["A", "B", "C", "D", "+10", "-10", "OHI", "NS"].map((label) => (
              <th key={label} className="p-2 border">
                {label}
              </th>
            ))}
            <th className="p-2 border">Aika</th>
            <th className="p-2 border">Pisteet</th>
            <th className="p-2 border">HF</th>
            <th className="p-2 border">Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {currentPage.participants.map((p) => {
            const pid = p.id;
            const score = calculateScore(p.hits);
            const hf = parseFloat(p.time) > 0 ? (score / parseFloat(p.time)).toFixed(2) : "0.00";
            const isActive = pid === activeParticipantId;

            return (
              <tr key={pid} className={`border ${isActive ? "bg-yellow-100" : ""}`}>
                <td className="p-2 border font-semibold">{p.name}</td>
                {["A", "B", "C", "D", "+10", "-10", "OHI", "NS"].map((key) => (
                  <td key={key} className="p-2 border">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={p.hits[key] === 0 ? "" : p.hits[key]}
                        onChange={(e) => {
                          if (!isActive) return;
                          const value = parseInt(e.target.value, 10);
                          const np = [...rasterPages];
                          np[currentPageIndex].participants = np[currentPageIndex].participants.map((pp) =>
                            pp.id === pid ? { ...pp, hits: { ...pp.hits, [key]: isNaN(value) ? 0 : value } } : pp
                          );
                          setRasterPages(np);
                        }}
                        className="w-14 px-1 py-0.5 border rounded"
                        disabled={!isActive}
                      />
                      <div className="flex gap-1">
                        <button
                          className="px-1 text-xs bg-green-200 rounded"
                          disabled={!isActive}
                          onClick={() => {
                            const np = [...rasterPages];
                            np[currentPageIndex].participants = np[currentPageIndex].participants.map((pp) =>
                              pp.id === pid ? { ...pp, hits: { ...pp.hits, [key]: (pp.hits[key] || 0) + 1 } } : pp
                            );
                            setRasterPages(np);
                          }}
                        >
                          +1
                        </button>
                        <button
                          className="px-1 text-xs bg-red-200 rounded"
                          disabled={!isActive}
                          onClick={() => {
                            const np = [...rasterPages];
                            np[currentPageIndex].participants = np[currentPageIndex].participants.map((pp) =>
                              pp.id === pid
                                ? { ...pp, hits: { ...pp.hits, [key]: Math.max(0, (pp.hits[key] || 0) - 1) } }
                                : pp
                            );
                            setRasterPages(np);
                          }}
                        >
                          -1
                        </button>
                        <button
                          className="px-1 text-xs bg-gray-300 rounded"
                          disabled={!isActive}
                          onClick={() => {
                            const np = [...rasterPages];
                            np[currentPageIndex].participants = np[currentPageIndex].participants.map((pp) =>
                              pp.id === pid ? { ...pp, hits: { ...pp.hits, [key]: 0 } } : pp
                            );
                            setRasterPages(np);
                          }}
                        >
                          0
                        </button>
                      </div>
                    </div>
                  </td>
                ))}
                <td className="p-2 border">
                  <input
                    type="number"
                    min={0}
                    value={p.time || ""}
                    onChange={(e) => {
                      if (!isActive) return;
                      const input = e.target.value.replace(",", ".");
                      const value = parseFloat(input);
                      const np = [...rasterPages];
                      np[currentPageIndex].participants = np[currentPageIndex].participants.map((pp) =>
                        pp.id === pid ? { ...pp, time: isNaN(value) ? 0 : value } : pp
                      );
                      setRasterPages(np);
                    }}
                    className="w-20 px-1 py-0.5 border rounded"
                    disabled={!isActive}
                  />
                </td>
                <td className="p-2 border font-bold">{score}</td>
                <td className="p-2 border">{hf}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => setActiveParticipantId(pid)}
                    className={`px-2 py-1 rounded mb-1 ${
                      isActive ? "bg-green-500 text-white" : "bg-yellow-400 text-black"
                    }`}
                  >
                    {isActive ? "Valittu" : "Valitse"}
                  </button>
                  <br />
                  <button onClick={() => removeParticipant(pid)} className="text-red-600">
                    Poista
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {rasterPages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Yhteenveto</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nimi</th>
                <th className="p-2 border">Yht. pisteet</th>
                <th className="p-2 border">Kokonaisaika</th>
                <th className="p-2 border">Kokonais HF</th>
                <th className="p-2 border">%</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const userData = {};
                const rastinVoittajaHF = {};
                rasterPages.forEach((r) => {
                  let bestHF = 0;
                  r.participants.forEach((p) => {
                    const score = calculateScore(p.hits);
                    const time = parseFloat(p.time) || 0;
                    const hf = time > 0 ? score / time : 0;
                    if (!userData[p.name]) userData[p.name] = { total: 0, totalTime: 0 };
                    userData[p.name].totalTime += time;
                    if (hf > bestHF) bestHF = hf;
                  });
                  rastinVoittajaHF[r.id] = bestHF;
                });

                rasterPages.forEach((r) => {
                  const maxPisteet = (r.targets + r.steels) * 10;
                  r.participants.forEach((p) => {
                    const score = calculateScore(p.hits);
                    const time = parseFloat(p.time) || 0;
                    const hf = time > 0 ? score / time : 0;
                    const hfProsentti = rastinVoittajaHF[r.id] > 0 ? hf / rastinVoittajaHF[r.id] : 0;
                    const pisteet = parseFloat((hfProsentti * maxPisteet).toFixed(2));
                    userData[p.name].total += pisteet;
                  });
                });

                const summaryArray = Object.entries(userData).map(([name, data]) => {
                  const kokHF = data.totalTime > 0 ? data.total / data.totalTime : 0;
                  return { name, total: data.total, totalTime: data.totalTime, kokHF };
                });

                const bestKokHF = summaryArray.length ? Math.max(...summaryArray.map((d) => d.kokHF)) : 0;

                return summaryArray
                  .sort((a, b) => b.kokHF - a.kokHF)
                  .map((d) => (
                    <tr key={d.name}>
                      <td className="p-2 border font-semibold">{d.name}</td>
                      <td className="p-2 border">{d.total.toFixed(2)}</td>
                      <td className="p-2 border">{d.totalTime.toFixed(2)}</td>
                      <td className="p-2 border">{d.kokHF.toFixed(2)}</td>
                      <td className="p-2 border">
                        {bestKokHF > 0 ? ((d.kokHF / bestKokHF) * 100).toFixed(2) : "0.00"}%
                      </td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
