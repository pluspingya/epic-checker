var slickUI, mainPanel, sidePanel, menuButton;

function createMenu() {

  mainPanel = createMainPanel();

  let mainPanelBaseY = mainPanel.panel.y;
  mainPanel.panel.visible = false;

  var openPanel = () => {
    if(mainPanel.panel.visible) {
        return;
    }
    mainPanel.panel.visible = true;
    mainPanel.panel.y = mainPanelBaseY - mainPanel.panel.height * 0.5;
    mainPanel.panel.alpha = 0;
    game.add.tween(mainPanel.panel).to( {y: mainPanelBaseY, alpha: 1}, 500, Phaser.Easing.Exponential.Out, true);
    slickUI.container.displayGroup.bringToTop(mainPanel.panel.container.displayGroup);
  };

  let closePanel = () => {
    game.add.tween(mainPanel.panel).to( {y: mainPanelBaseY - mainPanel.panel.height * 0.5, alpha: 0}, 500, Phaser.Easing.Exponential.Out, true).onComplete.add(function () {
      mainPanel.panel.visible = false;
    });
  };

  mainPanel.startButton.events.onInputDown.add(() => {
    closePanel();
    if (mainPanel.checkboxes[0].checked)
      return start(PvP);
    if (mainPanel.checkboxes[1].checked)
      return start(PvC);
    if (mainPanel.checkboxes[2].checked)
      return start(CvC);
  });

  openPanel();

}

function createMainPanel() {

  var panelSize = {
    width: 300,
    height: 350
  };

  var buttonSize = {
    width: 260,
    height: 50
  };

  let y = 0;
  let panel, startButton, tutorialButton;

  slickUI.add(panel = new SlickUI.Element.Panel(
    (game.width * 0.5) - (panelSize.width * 0.5),
    (game.height * 0.5) - (panelSize.height * 0.5),
    panelSize.width,
    panelSize.height));
  panel.add(new SlickUI.Element.Text(10, 0, 'Menu')).centerHorizontally().text.alpha = 0.5;

  var checkBoxes = [
    {
      checkbox: null,
      label: null,
      text: "Player vs Player"
    },
    {
      checkbox: null,
      label: null,
      text: "Player vs AI"
    },
    {
      checkbox: null,
      label: null,
      text: "AI vs AI"
    }
  ];

  checkBoxes.forEach(item => {
    y += buttonSize.height;
    panel.add(item.checkbox = new SlickUI.Element.Checkbox(15, y, SlickUI.Element.Checkbox.TYPE_RADIO));
    item.checkbox.events.onInputDown.add(function () {
         checkBoxes.forEach(itm => itm.checkbox.checked = false);
         item.checkbox.checked = true;
    }, this);
    panel.add(new SlickUI.Element.Text(70, y, item.text));
  });
  checkBoxes[0].checkbox.checked = true;

  y += buttonSize.height;
  panel.add(startButton = new SlickUI.Element.Button(
    (panelSize.width * 0.5) - (buttonSize.width * 0.5),
    y,
    buttonSize.width,
    buttonSize.height * 1.5));
  startButton.add(new SlickUI.Element.Text(0,0, "Start")).center();

  // y += buttonSize.height * 1.7;
  // panel.add(tutorialButton = new SlickUI.Element.Button(
  //   (panelSize.width * 0.5) - (buttonSize.width * 0.5),
  //   y,
  //   buttonSize.width,
  //   buttonSize.height * 0.75));
  // tutorialButton.add(new SlickUI.Element.Text(0,0, "Tutorial")).center();

  let basePosition = panel.y;


  // startButton.events.onInputDown.add(closePanel);
  // tutorialButton.events.onInputDown.add(closePanel);

  return {
    panel,
    checkboxes: [
      checkBoxes[0].checkbox,
      checkBoxes[1].checkbox,
      checkBoxes[2].checkbox
    ],
    startButton,
//    tutorialButton
  };
}
