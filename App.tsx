
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Play, 
  RotateCcw, 
  Eye, 
  Skull, 
  HelpCircle,
  Trophy,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { WORD_PAIRS } from './constants';
import { Role, Player, GameSettings, GameStage, WordPair } from './types';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.SETUP);
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 6,
    undercoverCount: 1,
    mrWhiteCount: 0
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [hasSeenCurrentCard, setHasSeenCurrentCard] = useState(false);
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);

  const startGame = useCallback(() => {
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    setCurrentWordPair(pair);

    const totalRoles: Role[] = [];
    for (let i = 0; i < settings.undercoverCount; i++) totalRoles.push(Role.UNDERCOVER);
    for (let i = 0; i < settings.mrWhiteCount; i++) totalRoles.push(Role.MR_WHITE);
    while (totalRoles.length < settings.playerCount) totalRoles.push(Role.CIVILIAN);

    const shuffledRoles = [...totalRoles];
    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
    }

    const initialPlayers: Player[] = shuffledRoles.map((role, index) => ({
      id: index,
      name: `玩家 ${index + 1}`,
      role: role,
      word: role === Role.CIVILIAN ? pair.civilian : (role === Role.UNDERCOVER ? pair.undercover : "???"),
      isAlive: true,
      hasSeenCard: false
    }));

    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setIsCardFlipped(false);
    setHasSeenCurrentCard(false);
    setStage(GameStage.DEALING);
  }, [settings]);

  const resetGame = () => {
    setStage(GameStage.SETUP);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setIsCardFlipped(false);
    setHasSeenCurrentCard(false);
  };

  const handleNextPlayer = () => {
    if (!hasSeenCurrentCard) return;

    // 先翻转回背面
    setIsCardFlipped(false);
    
    // 延迟切换，让翻转动画完成
    setTimeout(() => {
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setHasSeenCurrentCard(false);
      } else {
        setStage(GameStage.PLAYING);
      }
    }, 300);
  };

  const handleFlipCard = () => {
    const newFlipState = !isCardFlipped;
    setIsCardFlipped(newFlipState);
    if (newFlipState) {
      setHasSeenCurrentCard(true);
    }
  };

  const toggleElimination = (id: number) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, isAlive: !p.isAlive } : p));
  };

  const checkWinner = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveUndercovers = alivePlayers.filter(p => p.role === Role.UNDERCOVER).length;
    const aliveMrWhites = alivePlayers.filter(p => p.role === Role.MR_WHITE).length;
    const aliveCivilians = alivePlayers.length - aliveUndercovers - aliveMrWhites;

    if (aliveUndercovers + aliveMrWhites === 0) return "平民胜利！";
    if (aliveUndercovers + aliveMrWhites >= aliveCivilians) return "卧底/白板胜利！";
    return null;
  };

  const winnerMessage = useMemo(() => {
    if (stage !== GameStage.PLAYING) return null;
    return checkWinner();
  }, [players, stage]);

  const SetupView = () => (
    <div className="flex flex-col gap-8 max-w-md mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          谁是卧底
        </h1>
        <p className="text-slate-400">本地离线版 • 10,000+ 词库</p>
      </div>

      <div className="space-y-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm font-bold text-slate-300">
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> 总人数</span>
            <span className="text-lg text-white bg-blue-600/30 px-3 py-1 rounded-full">{settings.playerCount}</span>
          </label>
          <input 
            type="range" min="3" max="20" 
            value={settings.playerCount} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSettings(s => ({ 
                ...s, 
                playerCount: val,
                undercoverCount: Math.max(1, Math.min(Math.floor(val / 3), s.undercoverCount)) 
              }));
            }}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <UserPlus className="w-3 h-3 text-emerald-400" /> 卧底
            </label>
            <div className="flex items-center justify-between bg-slate-900/50 rounded-2xl p-2 border border-slate-700">
              <button onClick={() => setSettings(s => ({ ...s, undercoverCount: Math.max(1, s.undercoverCount - 1) }))} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all font-bold text-xl">-</button>
              <span className="font-black text-2xl text-emerald-400">{settings.undercoverCount}</span>
              <button onClick={() => setSettings(s => ({ ...s, undercoverCount: Math.min(Math.floor(settings.playerCount/2), s.undercoverCount + 1) }))} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all font-bold text-xl">+</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 text-amber-400" /> 白板
            </label>
            <div className="flex items-center justify-between bg-slate-900/50 rounded-2xl p-2 border border-slate-700">
              <button onClick={() => setSettings(s => ({ ...s, mrWhiteCount: Math.max(0, s.mrWhiteCount - 1) }))} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all font-bold text-xl">-</button>
              <span className="font-black text-2xl text-amber-400">{settings.mrWhiteCount}</span>
              <button onClick={() => setSettings(s => ({ ...s, mrWhiteCount: Math.min(1, s.mrWhiteCount + 1) }))} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all font-bold text-xl">+</button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={startGame} className="w-full py-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-t border-white/20">
        <Play className="w-6 h-6 fill-current" /> 开启派对
      </button>
    </div>
  );

  const DealingView = () => {
    const player = players[currentPlayerIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-widest uppercase">
            正在发牌 {currentPlayerIndex + 1} / {players.length}
          </div>
          <h2 className="text-4xl font-black text-white">{player.name}</h2>
          <p className="text-slate-400">点击卡牌翻转查看，请保护好隐私</p>
        </div>

        <div className="card-container perspective-1000 w-72 h-[450px] cursor-pointer touch-none" onClick={handleFlipCard}>
          <div className={`w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[40px] ${isCardFlipped ? 'rotate-y-180' : ''}`}>
            {/* 正面 */}
            <div className="absolute inset-0 bg-slate-900 rounded-[40px] border-4 border-slate-800 flex flex-col items-center justify-center gap-6 backface-hidden shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 shadow-inner">
                <Eye className="w-12 h-12 text-slate-500" />
              </div>
              <div className="text-center">
                <span className="text-2xl font-black text-slate-600 uppercase tracking-widest block">点击查看</span>
                <span className="text-xs text-slate-700 font-bold mt-2 block">SECRET CARD</span>
              </div>
            </div>

            {/* 背面 */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] border-4 border-blue-400/50 flex flex-col items-center justify-center gap-8 backface-hidden rotate-y-180 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-white/5 skew-y-12 -translate-y-16" />
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
                <Unlock className="w-10 h-10 text-white" />
              </div>
              <div className="text-center space-y-2 z-10 px-6">
                <span className="block text-blue-200 text-xs font-bold uppercase tracking-[0.2em]">你的词汇是</span>
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg break-words">
                  {player.word}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <button 
            onClick={handleNextPlayer}
            disabled={!hasSeenCurrentCard}
            className={`
              w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-2
              ${hasSeenCurrentCard 
                ? 'bg-white text-slate-900 active:scale-95 cursor-pointer shadow-white/10' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700 shadow-none'
              }
            `}
          >
            {hasSeenCurrentCard ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            {currentPlayerIndex === players.length - 1 ? "所有人已查看" : "下一位玩家"}
            {hasSeenCurrentCard && <ChevronRight className="w-6 h-6" />}
          </button>
          
          {!hasSeenCurrentCard && (
            <p className="text-slate-500 text-xs text-center font-bold animate-pulse">需翻开卡牌确认词汇后才能继续</p>
          )}
        </div>
      </div>
    );
  };

  const PlayingView = () => (
    <div className="p-4 space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-lg sticky top-5 z-40 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">讨论阶段</span>
          <span className="text-xl font-black text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" /> 描述并找出卧底
          </span>
        </div>
        <button onClick={resetGame} className="p-3 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-2xl transition-all border border-slate-600 shadow-sm">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {players.map(player => (
          <div 
            key={player.id}
            onClick={() => toggleElimination(player.id)}
            className={`
              relative p-6 rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden
              ${player.isAlive 
                ? 'bg-slate-800/40 border-slate-700 shadow-lg hover:border-blue-500/40 hover:translate-y-[-2px]' 
                : 'bg-slate-900 border-red-900/30 opacity-40 grayscale scale-95'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${player.isAlive ? 'bg-slate-700/50 shadow-inner' : 'bg-red-950/50'}`}>
                {player.isAlive ? <UserCheck className="w-10 h-10 text-blue-400" /> : <Skull className="w-10 h-10 text-red-600" />}
              </div>
              <span className={`text-lg font-black tracking-tight ${player.isAlive ? 'text-white' : 'text-slate-600'}`}>{player.name}</span>
            </div>
            {!player.isAlive && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                 <div className="rotate-[-25deg] border-4 border-red-600/30 px-4 py-1 rounded-xl text-red-600/40 font-black text-2xl">OUT</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {winnerMessage && (
        <div className="fixed inset-x-0 bottom-8 px-4 z-50 animate-in slide-in-from-bottom-12">
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg"><Trophy className="w-10 h-10 text-white" /></div>
            <div>
              <h3 className="text-4xl font-black text-white mb-2">{winnerMessage}</h3>
              <p className="text-slate-400 text-sm">游戏结束，全员揭秘！</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 mt-2">
              <button onClick={() => setStage(GameStage.FINISHED)} className="py-4 bg-slate-800 text-slate-100 rounded-2xl font-bold transition-all border border-slate-700">查看真相</button>
              <button onClick={startGame} className="py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all">再来一局</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const FinishedView = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-20">
      <div className="text-center space-y-3">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-xl" />
        <h2 className="text-5xl font-black text-white tracking-tighter">本局真相</h2>
      </div>

      <div className="bg-slate-800/80 rounded-[40px] border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 bg-slate-900/50 border-b border-slate-700 grid grid-cols-2 gap-8">
          <div className="text-center"><span className="text-[10px] text-blue-500 font-black uppercase block">平民词</span><span className="text-3xl font-black text-white">{currentWordPair?.civilian}</span></div>
          <div className="text-center"><span className="text-[10px] text-emerald-500 font-black uppercase block">卧底词</span><span className="text-3xl font-black text-white">{currentWordPair?.undercover}</span></div>
        </div>
        <div className="p-4 space-y-3">
          {players.map(p => (
            <div key={p.id} className="p-5 rounded-3xl bg-slate-900/30 flex items-center justify-between border border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.isAlive ? 'bg-blue-600/20' : 'bg-red-600/20'}`}>{p.isAlive ? <UserCheck className="w-5 h-5 text-blue-400" /> : <Skull className="w-5 h-5 text-red-500" />}</div>
                <div><span className="font-black text-lg block">{p.name}</span><span className={`text-[10px] font-bold uppercase ${p.role === Role.CIVILIAN ? 'text-blue-500' : 'text-emerald-500'}`}>{p.role === Role.CIVILIAN ? "平民" : "卧底"}</span></div>
              </div>
              <span className="text-xl font-bold text-slate-300 bg-slate-800 px-4 py-1.5 rounded-2xl border border-slate-700">{p.word}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={resetGame} className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] font-black text-2xl shadow-2xl transition-all text-white">返回主菜单</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-x-hidden">
      <header className="p-5 flex items-center justify-between max-w-5xl mx-auto border-b border-slate-800/50 bg-slate-900/40 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Eye className="w-6 h-6 text-white" /></div>
          <div><span className="font-black text-xl tracking-tighter block leading-none">Who Spy</span><span className="text-[10px] text-slate-500 font-bold uppercase">Game Master</span></div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stage}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {stage === GameStage.SETUP && <SetupView />}
        {stage === GameStage.DEALING && <DealingView />}
        {stage === GameStage.PLAYING && <PlayingView />}
        {stage === GameStage.FINISHED && <FinishedView />}
      </main>
    </div>
  );
};

export default App;
