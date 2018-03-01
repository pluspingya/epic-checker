class Guides {

  static preload(game) {
    Guide.preload(game);
  }

  constructor(game, group) {
      this.game = game;
      this.guides = [];
      this.group = group;
  }

  show(tiles) {

    let guideIndex = 0;
    for(; guideIndex<tiles.length; guideIndex++) {
      var tile = tiles[guideIndex];
      if (guideIndex >= this.guides.length)
        this.guides.push(new Guide(this.game, this.group));

      this.guides[guideIndex].visible = true;
      this.guides[guideIndex].setToTile(tile);
    }

    while(guideIndex < this.guides.length) {
      this.guides[guideIndex].visible = false;
      guideIndex++;
    }

  }

  hide() {
    this.guides.forEach(guide => guide.visible = false);
  }
}
