
  window.chesscom = window.chesscom || {};

  // Before adding global experiments please check in #experiments_chat slack channel for the performance costs
  
  // We can use this to force experiment segment when doing cleanups but there are still CPs using the experiment
  
  // NOTE, bucketing occurs as a side-effect to checking whether or not a user is bucketed.
  // this means that adding an experiment above this check will bucket unauthenticated users!
  // If you're unsure whether that is intended with your experiment or not, please check with
  // product.

  
      window.chesscom.experiments = {"web_animated_coach_puzzles_experiment":"segment_a_animated_coach"}
  
      Object.assign(window.chesscom.experiments, {"payments_no_ads_plan_price_testing":"variant_2"});
  