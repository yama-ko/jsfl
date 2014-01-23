// Frame2Symbol
//
// yama_ko
// http://www.yama-ko.net/
// ショートカットctrl+alt+F8あたりオススメ。

// ダイアログを開く
var Frame2SymbolDialog = fl.getDocumentDOM().xmlPanel(fl.configURI+"Commands/Frame2Symbol.xml");

//OKボタンが押されたら
if (Frame2SymbolDialog.dismiss == "accept") {
	
	//flashのタイムラインとかを扱うため変数に格納
	var dom = fl.getDocumentDOM();
	var tl = dom.getTimeline();
	var lib = dom.library;	
	
	//ダイアログからシンボル名とシンボルタイプを取得しておく
	var newName = String(Frame2SymbolDialog.newsymbolName);
	var newType = String(Frame2SymbolDialog.newsymbolType);
	
	//ダイアログの入力に従って空の新規シンボルを作成
	//名前がかぶってないことも確認
	if(lib.addNewItem(newType, newName) == true) {
		
		//現在選択されているフレーム範囲と、その始めと終わりの位置を取得
		var selectedFrames=tl.getSelectedFrames();
		var startPosition = selectedFrames[1];
		var endPosition = selectedFrames[2];
	
		//フレームが選択されていたら
		if(selectedFrames[0] >= 0)
		{
			//そのフレームをコピー。フレーム選択が矩形でない場合ここで終了。
			tl.copyFrames();			
			
			//選択フレーム矩形の最上部を選択レイヤーに設定
			//（選択レイヤーは、選択フレームから一意に定まらない。選択順による。）
			tl.setSelectedLayers(selectedFrames[0]);
			
			//新規レイヤーを作る
			tl.addNewLayer(newName);
			
			//フラグ処理：削除フラグが立ってたら、選択フレームからレイヤー枚数を計算してレイヤーを削除。
			if(Frame2SymbolDialog.deleteFlag == "true"){
				
				//新規レイヤーが増えたので1枚下を選択。
				tl.setSelectedLayers(selectedFrames[0]+1);
				
				// 選択フレームからレイヤー枚数計算、その数だけ削除
				for(i = 0; i < (selectedFrames.length / 3); i++) {
					tl.deleteLayer();
				}
				
				// 選択レイヤーを新規レイヤーに戻す。
				tl.setSelectedLayers(selectedFrames[0]);
			}
			
			//フラグ処理：カットフラグが立ってたら、シンボルの長さに合わせて空白キーフレームを入れる
			if(Frame2SymbolDialog.cutFlag == "true"){
				tl.setSelectedFrames(endPosition,endPosition);
				tl.convertToBlankKeyframes();
			}
			
			//開始フレームへ。
			tl.setSelectedFrames(startPosition,startPosition);

			//開始フレームが1フレーム目じゃなかったら、そこを空白キーフレームに変換
			if(startPosition > 0){
				tl.convertToBlankKeyframes();
			}
					
			//作ったシンボルを選択して
			dom.library.selectItem(newName);
			
			//コピー元がルートだったら、シンボル化して重なるように座標を調整して配置
			//コピー元がシンボル内だったら、そのままの座標で配置
			if(tl.name == "シーン 1") {
				dom.library.addItemToDocument({x:(dom.width/2), y:(dom.height/2)}, newName);
			} else {
				dom.library.addItemToDocument({x:0, y:0}, newName);
			}
			
			// フラグ処理：グラフィックシンボルで、かつ一回再生フラグが立ってたら一回再生にしておく
			if(newType == "graphic" && Frame2SymbolDialog.notLoopFlag == "true"){
				dom.setElementProperty('loop', 'play once');
			}
			
			// シンボルを同じ場所で編集モード
			dom.enterEditMode('inPlace');
			
			// 新規シンボルのタイムラインを取得し直して、選択されてたフレームを1フレーム目にペースト	
			fl.getDocumentDOM().getTimeline().setSelectedFrames(0, 0);
			fl.getDocumentDOM().getTimeline().pasteFrames();
			
			// シンボル内編集モードの終了
			fl.getDocumentDOM().exitEditMode();
		}
	}
}
