
    window.chesscom = window.chesscom || {};
    window.chesscom.puzzles = {
      dailyPuzzleRoute: "https://www.chess.com/daily",
              battleServiceUri: "https://www.chess.com/service/battle/",
        presenceServiceUri: "https://www.chess.com/service/presence/",
          };

    Object.assign(window.chesscom.puzzles, {
      htmlTitles: {"learning":"Chess Puzzles - Learn Themes and Patterns","rated":"Chess Puzzles - Improve Your Chess by Solving Tactics","rush":"Puzzle Rush - Compete to Solve Chess Puzzles","battle":"Puzzle Battle - Compete with your Chess Friends","default":"Chess Puzzles - 500k+ Problems to Improve Your Tactics"},
      reachedLimits: {"learning":false,"rated":false,"rush":false,"ratedLimitPerDay":10},
      rushId: '',
      opponentSounds: false,
      puzzle: null,
      battleId: '',
      showAd: true,
      retrySubmitBattleMoveTimeout: 3000,
      shouldShowPuzzlePathRedesign: true
    });

    
    // Feature Flags
    
    
    window.chesscom.features.push('');
  