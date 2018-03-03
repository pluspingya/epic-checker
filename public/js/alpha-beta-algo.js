const AlphaBetaNodeTypeMaximizer = 'MAXIMIZER';
const AlphaBetaNodeTypeMinimizer = 'MINIMIZER';
const AlphaBetaInfinity = 99999999;

class AlphaBetaNode {
  constructor(isMaximizer) {
    this.isMaximizer = isMaximizer;
    this.alpha = - AlphaBetaInfinity;
    this.beta = + AlphaBetaInfinity;
    this.value = this.isMaximizer ? this.alpha : this.beta;
  }
}

class AlphaBetaAlgo {
  constructor() {

  }
}
