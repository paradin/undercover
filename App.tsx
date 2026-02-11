
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Play, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Skull, 
  CheckCircle2, 
  HelpCircle,
  Trophy,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { WORD_PAIRS } from './constants';
import { Role, Player, GameSettings, GameStage, WordPair } from './types';

const App: React.FC = () => {
  // Game State
  const [stage, setStage] = useState<GameStage>(GameStage.SETUP);
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 5,
    undercoverCount: 1,
    mrWhiteCount: 0
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);

  // Initialize Game
  const startGame = useCallback(() => {
    // Pick a random word pair
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    setCurrentWordPair(pair);

    // Prepare roles
    const totalRoles: Role[] = [];
    for (let i = 0; i < settings.undercoverCount; i++) totalRoles.push(Role.UNDERCOVER);
    for (let i = 0; i < settings.mrWhiteCount; i++) totalRoles.push(Role.MR_WHITE);
    while (totalRoles.length < settings.playerCount) totalRoles.push(Role.CIVILIAN);

    // Shuffle roles
    const shuffledRoles = [...totalRoles].sort(() => Math.random() - 0.5);

    // Create players
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
    setStage(GameStage.DEALING);
  }, [settings]);

  const resetGame = () => {
    setStage(GameStage.SETUP);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setIsCardFlipped(false);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setIsCardFlipped(false);
    } else {
      setStage(GameStage.PLAYING);
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

  const winnerMessage = useMemo(() => checkWinner(), [players]);

  // UI Components
  const SetupView = () => (
    <div className="flex flex-col gap-8 max-w-md mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          谁是卧底
        </h1>
        <p className="text-slate-400">聚会必备推理辅助工具</p>
      </div>

      <div className="space-y-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Users className="w-4 h-4" /> 总人数: {settings.playerCount}
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
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <UserPlus className="w-3 h-3" /> 卧底人数
            </label>
            <div className="flex items-center justify-between bg-slate-900 rounded-xl p-2 border border-slate-700">
              <button 
                onClick={() => setSettings(s => ({ ...s, undercoverCount: Math.max(1, s.undercoverCount - 1) }))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >-</button>
              <span className="font-bold text-blue-400">{settings.undercoverCount}</span>
              <button 
                onClick={() => setSettings(s => ({ ...s, undercoverCount: Math.min(Math.floor(settings.playerCount/2), s.undercoverCount + 1) }))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >+</button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <HelpCircle className="w-3 h-3" /> 白板人数
            </label>
            <div className="flex items-center justify-between bg-slate-900 rounded-xl p-2 border border-slate-700">
              <button 
                onClick={() => setSettings(s => ({ ...s, mrWhiteCount: Math.max(0, s.mrWhiteCount - 1) }))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >-</button>
              <span className="font-bold text-emerald-400">{settings.mrWhiteCount}</span>
              <button 
                onClick={() => setSettings(s => ({ ...s, mrWhiteCount: Math.min(1, s.mrWhiteCount + 1) }))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >+</button>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={startGame}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-current" /> 开始游戏
      </button>
    </div>
  );

  const DealingView = () => {
    const player = players[currentPlayerIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-300">轮到 {player.name}</h2>
          <p className="text-slate-500">点击卡牌查看你的词汇，确保他人看不见</p>
        </div>

        <div 
          className="relative w-64 h-96 perspective-1000 cursor-pointer"
          onClick={() => setIsCardFlipped(true)}
        >
          <div className={`w-full h-full transition-all duration-700 preserve-3d ${isCardFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl border-4 border-slate-600 flex flex-col items-center justify-center gap-4 backface-hidden shadow-2xl">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-500 animate-pulse">
                <HelpCircle className="w-10 h-10 text-slate-400" />
              </div>
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">点击翻转</span>
            </div>

            {/* Back */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl border-4 border-blue-400 flex flex-col items-center justify-center gap-6 backface-hidden rotate-y-180 shadow-2xl">
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                <Eye className="w-8 h-8 text-blue-100" />
              </div>
              <div className="text-center">
                <span className="block text-blue-200 text-sm font-medium mb-1">你的词汇是</span>
                <span className="text-4xl font-black text-white tracking-tighter">{player.word}</span>
              </div>
              <div className="mt-8 bg-blue-500/30 px-4 py-2 rounded-lg border border-blue-400/30">
                <p className="text-xs text-blue-100/80 text-center">记好后点击下方按钮<br/>传递给下一位</p>
              </div>
            </div>
          </div>
        </div>

        {isCardFlipped && (
          <button 
            onClick={handleNextPlayer}
            className="w-full max-w-xs py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {currentPlayerIndex === players.length - 1 ? "开始讨论" : "下一位玩家"} <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const PlayingView = () => (
    <div className="p-4 space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">当前状态</span>
          <span className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <Users className="w-4 h-4" /> 自由讨论 & 投票
          </span>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all border border-slate-600"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {players.map(player => (
          <div 
            key={player.id}
            onClick={() => toggleElimination(player.id)}
            className={`
              relative p-6 rounded-3xl border-2 transition-all cursor-pointer group
              ${player.isAlive 
                ? 'bg-slate-800/30 border-slate-700 hover:border-blue-500/50' 
                : 'bg-red-950/20 border-red-900/50 opacity-60 grayscale'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                ${player.isAlive ? 'bg-slate-700 group-hover:bg-blue-600/20' : 'bg-red-900/30'}
              `}>
                {player.isAlive ? (
                  <UserCheck className={`w-8 h-8 ${player.isAlive ? 'text-blue-400' : 'text-slate-500'}`} />
                ) : (
                  <Skull className="w-8 h-8 text-red-500" />
                )}
              </div>
              <span className={`font-bold ${player.isAlive ? 'text-white' : 'text-red-400 line-through'}`}>
                {player.name}
              </span>
            </div>

            {!player.isAlive && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 border-2 border-slate-900">
                <Skull className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {winnerMessage && (
        <div className="fixed inset-x-0 bottom-8 px-4 animate-in slide-in-from-bottom-8">
          <div className="max-w-md mx-auto bg-gradient-to-r from-emerald-600 to-blue-600 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center">
            <Trophy className="w-12 h-12 text-yellow-300" />
            <h3 className="text-3xl font-black">{winnerMessage}</h3>
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={() => setStage(GameStage.FINISHED)}
                className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors"
              >
                揭晓词汇
              </button>
              <button 
                onClick={startGame}
                className="py-3 bg-white text-blue-900 rounded-xl font-bold shadow-lg"
              >
                再来一局
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const FinishedView = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
        <h2 className="text-4xl font-black text-white">游戏结束</h2>
        <p className="text-slate-400">真相只有一个</p>
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-around">
          <div className="text-center">
            <span className="text-xs text-slate-500 block uppercase">平民词</span>
            <span className="text-xl font-bold text-blue-400">{currentWordPair?.civilian}</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500 block uppercase">卧底词</span>
            <span className="text-xl font-bold text-emerald-400">{currentWordPair?.undercover}</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-700">
          {players.map(p => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`w-3 h-3 rounded-full ${p.isAlive ? 'bg-blue-500' : 'bg-red-500'}`} />
                <span className="font-bold">{p.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-tighter ${
                  p.role === Role.CIVILIAN ? 'bg-blue-500/20 text-blue-400' : 
                  p.role === Role.UNDERCOVER ? 'bg-emerald-500/20 text-emerald-400' : 
                  'bg-white/20 text-white'
                }`}>
                  {p.role === Role.CIVILIAN ? "平民" : (p.role === Role.UNDERCOVER ? "卧底" : "白板")}
                </span>
                <span className="font-medium text-slate-300">{p.word}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={resetGame}
        className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-transform"
      >
        返回主页
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation Header */}
      <header className="p-4 flex items-center justify-between max-w-5xl mx-auto border-b border-slate-800 mb-6 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">Undercover.ai</span>
        </div>
        {stage !== GameStage.SETUP && (
          <div className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 uppercase tracking-widest">
            {stage}
          </div>
        )}
      </header>

      {/* Main Content Areas */}
      <main className="container mx-auto px-4">
        {stage === GameStage.SETUP && <SetupView />}
        {stage === GameStage.DEALING && <DealingView />}
        {stage === GameStage.PLAYING && <PlayingView />}
        {stage === GameStage.FINISHED && <FinishedView />}
      </main>

      {/* Mobile-Friendly Fixed Footer for active games */}
      {stage === GameStage.PLAYING && !winnerMessage && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 sm:hidden">
          <div className="flex justify-around text-xs font-bold text-slate-400">
            <div className="flex flex-col items-center">
              <Users className="w-5 h-5 mb-1" />
              <span>{players.filter(p => p.isAlive).length} 生还</span>
            </div>
            <div className="flex flex-col items-center text-red-400">
              <Skull className="w-5 h-5 mb-1" />
              <span>{players.filter(p => !p.isAlive).length} 淘汰</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
