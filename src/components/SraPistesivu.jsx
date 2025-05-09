import React, { useState } from "react";

export default function SraPistesivu() {
    const [rasterPages, setRasterPages] = useState([
        {
            id: 1,
            name: "Rasti 1",
            targets: 0,
            steels: 0,
            participants: [],
        },
    ]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [newName, setNewName] = useState("");
    const [showBanner, setShowBanner] = useState(false);
    const [message, setMessage] = useState("");

    const currentPage = rasterPages[currentPageIndex];

    const calculateScore = (hits) =>
        Math.max(
            0,
            hits.A * 5 +
            hits.B * 5 +
            hits.C * 3 +
            hits.D * 1 +
            hits["+10"] * 10 +
            hits["-10"] * -10 +
            hits.OHI * -10 +
            hits.NS * -10
        );

    const removeParticipant = (id) => {
        const np = [...rasterPages];
        np.forEach((page) => {
            page.participants = page.participants.filter((p) => p.id !== id);
        });
        setRasterPages(np);
    };

    const removeCurrentRasti = () => {
        const updated = rasterPages.filter((_, i) => i !== currentPageIndex);
        if (updated.length === 0) {
            setRasterPages([
                {
                    id: 1,
                    name: "Rasti 1",
                    targets: 0,
                    steels: 0,
                    participants: [],
                },
            ]);
            setCurrentPageIndex(0);
            setMessage("Tallennettu data ladattu onnistuneesti.");
            setTimeout(() => setMessage(""), 3000);
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        } else {
            setRasterPages(updated);
            setCurrentPageIndex(0);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-2 mb-4">
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
                        className={`px-3 py-1 rounded font-semibold ${i === currentPageIndex ? 'bg-red-600 text-white shadow-md' : 'bg-white border text-gray-700 hover:bg-gray-100'}`}
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
                                participants: rasterPages[0]?.participants.map(p => ({
                                    ...p,
                                    hits: { A: 0, B: 0, C: 0, D: 0, "+10": 0, "-10": 0, OHI: 0, NS: 0 },
                                    time: ""
                                })) || [],
                            },
                        ]);
                        setCurrentPageIndex(rasterPages.length);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                >
                    + Lisää rasti
                </button>
                <button
                    onClick={removeCurrentRasti}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                >
                    Poista rasti
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">Taulujen määrä</label>
                    <input
                        type="number"
                        className="border px-2 py-1 rounded w-24"
                        value={currentPage.targets || ""}
                        onChange={(e) => {
                            const newPages = [...rasterPages];
                            newPages[currentPageIndex].targets = parseInt(e.target.value) || 0;
                            setRasterPages(newPages);
                        }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Peltien määrä</label>
                    <input
                        type="number"
                        className="border px-2 py-1 rounded w-24"
                        value={currentPage.steels || ""}
                        onChange={(e) => {
                            const newPages = [...rasterPages];
                            newPages[currentPageIndex].steels = parseInt(e.target.value) || 0;
                            setRasterPages(newPages);
                        }}
                    />
                </div>
                <div className="text-sm font-semibold self-end pb-1">
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
                            const np = [...rasterPages];
                            let maxId = Math.max(0, ...rasterPages.flatMap(r => r.participants.map(p => p.id || 0)));
                            np.forEach(page => page.participants.push({
                                id: ++maxId,
                                name: newName.trim(),
                                hits: { A: 0, B: 0, C: 0, D: 0, "+10": 0, "-10": 0, OHI: 0, NS: 0 },
                                time: ""
                            }));
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
                <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded">
                    {message}
                </div>
            )}

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Nimi</th>
                        {["A", "B", "C", "D", "+10", "-10", "OHI", "NS"].map(label => (
                            <th key={label} className="p-2 border">{label}</th>
                        ))}
                        <th className="p-2 border">Aika</th>
                        <th className="p-2 border">Pisteet</th>
                        <th className="p-2 border">HF</th>
                        <th className="p-2 border">Poista</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPage.participants.map((p) => {
                        const pid = p.id;
                        const score = calculateScore(p.hits);
                        const hf = parseFloat(p.time) > 0 ? (score / parseFloat(p.time)).toFixed(2) : "0.00";
                        return (
                            <tr key={pid} className="border">
                                <td className="p-2 border font-semibold">{p.name}</td>
                                {["A", "B", "C", "D", "+10", "-10", "OHI", "NS"].map((key) => (
                                    <td key={key} className="p-2 border">
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="0"
                                                value={p.hits[key] === 0 ? "" : p.hits[key]}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value, 10);
                                                    const np = [...rasterPages];
                                                    np[currentPageIndex].participants = np[currentPageIndex].participants.map(pp =>
                                                        pp.id === pid
                                                            ? {
                                                                ...pp,
                                                                hits: {
                                                                    ...pp.hits,
                                                                    [key]: isNaN(value) ? 0 : value
                                                                }
                                                            }
                                                            : pp
                                                    );
                                                    setRasterPages(np);
                                                }}
                                                className="w-14 px-1 py-0.5 border rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const np = [...rasterPages];
                                                    np[currentPageIndex].participants = np[currentPageIndex].participants.map(pp =>
                                                        pp.id === pid
                                                            ? {
                                                                ...pp,
                                                                hits: {
                                                                    ...pp.hits,
                                                                    [key]: (pp.hits[key] || 0) + 1
                                                                }
                                                            }
                                                            : pp
                                                    );
                                                    setRasterPages(np);
                                                }}
                                                className="bg-gray-200 text-sm px-2 rounded hover:bg-gray-300"
                                            >
                                                +1
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const np = [...rasterPages];
                                                    np[currentPageIndex].participants = np[currentPageIndex].participants.map(pp =>
                                                        pp.id === pid
                                                            ? {
                                                                ...pp,
                                                                hits: {
                                                                    ...pp.hits,
                                                                    [key]: Math.max(0, (pp.hits[key] || 0) - 1)
                                                                }
                                                            }
                                                            : pp
                                                    );
                                                    setRasterPages(np);
                                                }}
                                                className="bg-gray-200 text-sm px-2 rounded hover:bg-gray-300"
                                            >
                                                -1
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const np = [...rasterPages];
                                                    np[currentPageIndex].participants = np[currentPageIndex].participants.map(pp =>
                                                        pp.id === pid
                                                            ? {
                                                                ...pp,
                                                                hits: {
                                                                    ...pp.hits,
                                                                    [key]: 0
                                                                }
                                                            }
                                                            : pp
                                                    );
                                                    setRasterPages(np);
                                                }}
                                                className="bg-gray-200 text-sm px-2 rounded hover:bg-gray-300"
                                            >
                                                0
                                            </button>
                                        </div>
                                    </td>
                                ))}
                                <td className="p-2 border">
                                    <input
                                        type="number"
                                        min="0"
                                        value={p.time || ""}
                                        onChange={(e) => {
                                            const input = e.target.value.replace(",", ".");
                                            const value = parseFloat(input);
                                            const np = [...rasterPages];
                                            np[currentPageIndex].participants = np[currentPageIndex].participants.map(pp =>
                                                pp.id === pid
                                                    ? { ...pp, time: isNaN(value) ? 0 : value }
                                                    : pp
                                            );
                                            setRasterPages(np);
                                        }}
                                        className="w-20 px-1 py-0.5 border rounded"
                                    />
                                </td>
                                <td className="p-2 border font-bold">{score}</td>
                                <td className="p-2 border">{hf}</td>
                                <td className="p-2 border">
                                    <button onClick={() => removeParticipant(pid)} className="text-red-600">Poista</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {(() => {
                const userData = {};
                const rastinVoittajaHF = {};

                rasterPages.forEach((r) => {
                    let bestHF = 0;
                    r.participants.forEach((p) => {
                        const score = calculateScore(p.hits);
                        const time = parseFloat(p.time) || 0;
                        const hf = time > 0 ? score / time : 0;
                        if (!userData[p.name]) userData[p.name] = { total: 0, totalTime: 0, totalHF: 0, rastipisteet: [], rasthf: [] };
                        userData[p.name].totalTime += time;
                        userData[p.name].totalHF += hf;
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
                        userData[p.name].rastipisteet.push(pisteet);
                        userData[p.name].rasthf.push(hf);
                        userData[p.name].total += pisteet;
                    });
                });

                const sorted = Object.entries(userData)
                    .map(([name, data]) => ({
                        name,
                        ...data,
                        avgHF: data.totalTime > 0 ? data.totalHF / rasterPages.length : 0,
                    }))
                    .sort((a, b) => b.total - a.total);

                const maxTotal = sorted[0]?.total || 1;

                return (
                    <section className="bg-white shadow p-4 rounded mt-6">
                        <h2 className="text-xl font-semibold mb-2">Yhteenveto</h2>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Nimi</th>
                                    {rasterPages.map((r, i) => (
                                        <React.Fragment key={i}>
                                            <th className="p-2 border">{r.name} pisteet</th>
                                            <th className="p-2 border">{r.name} HF</th>
                                        </React.Fragment>
                                    ))}
                                    <th className="p-2 border">Yhteispisteet</th>
                                    <th className="p-2 border">Aika</th>
                                    <th className="p-2 border">Kok. HF</th>
                                    <th className="p-2 border">Sija</th>
                                    <th className="p-2 border">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((u, idx) => (
                                    <tr key={u.name} className="border">
                                        <td className="p-2 border font-semibold">{u.name}</td>
                                        {u.rastipisteet.map((p, i) => (
                                            <React.Fragment key={i}>
                                                <td className="p-2 border">{p.toFixed(2)}</td>
                                                <td className="p-2 border">{u.rasthf[i]?.toFixed(2)}</td>
                                            </React.Fragment>
                                        ))}
                                        <td className="p-2 border font-bold">{u.total.toFixed(2)}</td>
                                        <td className="p-2 border">{u.totalTime.toFixed(2)}</td>
                                        <td className="p-2 border">{u.avgHF.toFixed(2)}</td>
                                        <td className="p-2 border">{idx + 1}</td>
                                        <td className="p-2 border">{((u.total / maxTotal) * 100).toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                );
            })()}
        </div>
    );
}
