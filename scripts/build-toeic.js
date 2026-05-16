#!/usr/bin/env node
// TSL v1.1 builder — fetches English definitions from Free Dictionary API
// Credit: Browne, C. & Culligan, B. (2016). TOEIC Service List v1.1. CC BY-SA 4.0.
// http://www.newgeneralservicelist.org

const fs   = require('fs');
const path = require('path');
const https = require('https');

const WORDS = ["abide","aboard","absent","absorb","accent","acceptance","accessible","accessory","acclaim","accommodate","accomplishment","accordingly","accountant","accumulate","accuracy","accurately","accustom","activate","actively","actress","adapter","additionally","adhere","adjacent","administer","administrative","administrator","admission","advancement","advertiser","advisable","advisor","advisory","affirmative","affordable","afterward","airfare","airplane","airport","aisle","alert","alike","allergy","allocate","alternate","alternatively","amateur","ambassador","ambitious","amenity","ample","amuse","anew","anniversary","announcer","annoy","annually","antique","anyhow","anytime","apology","appendix","appetizer","apple","appliance","applicable","applicant","appraisal","appreciation","apprehensive","apprentice","approximate","arc","architect","architectural","archive","artistic","asleep","aspect","assemble","assembly","assignment","assurance","athletic","attain","attendant","attendee","attire","attorney","auction","audit","audition","auditor","auditorium","authentic","authority","authorization","authorize","auto","automate","automatic","automobile","automotive","availability","await","backpack","bacteria","badge","baggage","bake","baker","bakery","balcony","balloon","ballroom","banker","bankrupt","bankruptcy","banquet","barbecue","bargain","baseball","basement","basket","basketball","bathroom","battery","bean","beforehand","beginner","behalf","bench","beneficial","beverage","bicycle","biography","biology","birthday","blanket","blueprint","boardroom","bonus","bookcase","booklet","bookstore","booth","born","bound","brainstorm","brake","briefcase","broaden","brochure","broker","broom","browse","buffet","bug","bulb","bulk","bulletin","businessman","businessperson","butter","bye","by-law","cab","cabin","cabinet","café","cafeteria","cage","calculation","calculator","calendar","caller","campus","cancellation","candidate","candy","captain","careless","cargo","carpenter","carrier","cart","carton","cartridge","cashier","casual","cater","caterer","caution","cautious","ceiling","celebrity","cellphone","centimeter","certificate","certification","certify","chairperson","charitable","checkout","checkup","cheer","cheeseburger","chef","chemistry","chilly","chronic","cinema","circuit","circulate","circulation","circus","clap","clarify","classify","classmate","cleaner","cleanliness","clerk","click","client","clinic","clip","closet","closure","cloth","cloudy","clue","collaboration","collector","colorful","comb","comfortably","commerce","commonly","commute","commuter","compact","compartment","compatible","compensate","compile","completion","compliance","complication","compliment","complimentary","comply","comprehension","concierge","conditioner","condominium","conductor","conference","confidential","confirmation","conform","congestion","congratulate","congratulation","consecutive","consent","considerably","considerate","consignment","consistently","consultation","consumption","container","contestant","continental","contraction","contractor","contradict","contradiction","contrary","convenience","convenient","conveniently","convey","cookbook","cookie","cooler","cooperate","coordinate","coordinator","copier","copyright","cord","cordless","correction","correctly","correspondence","cosmetic","costly","costume","counselor","countryside","coupon","courier","courtesy","coworker","crane","creativity","criteria","cruise","culinary","cumulative","cushion","customize","daytime","deadline","dealership","debit","deck","decorate","decoration","dedication","deduct","deduction","defect","defective","definite","delegate","delete","delicate","delicious","deluxe","demolish","dental","dentist","depart","departmental","departure","dependable","dependence","descriptive","designate","desirable","desktop","desperate","dessert","destination","detach","deteriorate","devastate","developer","diagnose","diagnostic","diagram","dial","diamond","dine","diner","diploma","directory","disable","disagreement","disappointment","discard","disconnect","discontinue","discrepancy","disgust","dishwasher","dislike","dispatch","disposal","dispose","disrupt","disruption","dissatisfy","distract","distraction","distractor","distribution","distributor","dive","dividend","dock","documentary","documentation","donate","donation","donut","doorman","dose","download","downsize","downstairs","downtown","downturn","drastically","drawback","drawer","drill","drought","drum","dull","duplicate","durable","duration","dynamic","eager","earthquake","e-book","economical","economically","economist","economize","editorial","effectiveness","efficiently","electrical","electrician","electronically","elegant","elephant","elevate","elevator","eligible","embassy","embed","enclose","energetic","engagement","enjoyable","enroll","enrollment","enthusiasm","enthusiast","enthusiastic","enthusiastically","entrée","entrepreneur","environmentally","equip","erase","escalator","escort","ethics","euro","evacuate","evenly","evident","excellence","exceptional","excessive","exclusive","exclusively","excursion","exemption","exit","exotic","expedite","expertise","expiration","expire","explanatory","explorer","extinguisher","fabric","facilitate","factual","faculty","familiarity","familiarize","fare","farewell","fasten","fatigue","faulty","favorable","fax","feedback","ferry","finalize","firefighter","firework","fiscal","fitness","fixture","flavor","flaw","fleet","flexibility","flextime","flour","flu","fluctuate","fluent","flyer","fog","folder","footwear","forbid","foreman","fork","formally","fortunately","forum","foster","founder","fountain","franchise","freelance","freight","freighter","frustrate","fry","fundraise","furnish","gallon","garage","garbage","gardener","garment","gasoline","generalization","generator","generic","generous","genre","getaway","glove","goods","gossip","graduation","gram","graph","graphic","graphics","grill","grocery","guidance","gum","gym","gymnasium","habitual","hacker","hallway","hamburger","handbook","handy","hardware","hardworking","harmful","hazard","hazardous","headache","headphone","headquarter","healthcare","healthful","heater","helmet","hereby","hesitant","hesitation","highway","hike","hiker","hobby","homeless","homemade","homeowner","homework","honestly","hospitality","hotline","hourly","housekeep","housekeeper","humidity","hungry","hurricane","hygiene","ice cream","icy","ideally","identification","illogical","immigration","impact","impatient","imperative","inappropriate","inclusive","incoming","incomplete","inconvenience","incur","indicator","indirect","individually","indoor","induction","inefficient","inexpensive","inexperience","infer","inference","inflate","influential","informal","informative","ingredient","ink","innovative","inquire","insert","inspect","inspection","inspector","inspiration","installation","institute","instruct","instructor","insufficient","integral","intently","interactive","interfere","intern","internationally","internet","internship","interpreter","interrupt","intersection","intonation","introductory","invaluable","invention","inventory","invoice","irregular","irrelevant","irritate","itinerary","jam","jazz","jeans","jet","jewelry","jog","journalism","juice","junior","junk","keyboard","kilogram","kilometer","kit","knowledgeable","lab","ladder","lamp","landlord","lane","laptop","lately","laundry","lawn","layoff","layout","leak","lease","lecturer","leisure","lengthy","letterhead","librarian","lifeguard","lifestyle","lifetime","lighter","lightweight","likewise","liter","lobby","locally","locker","logical","login","logo","loudly","lounge","loyal","loyalty","luggage","luncheon","lunchtime","ma'am","machinery","malfunction","mall","managerial","mandatory","manual","mask","massage","maximize","meaningful","meantime","mechanic","mechanical","media","medication","memo","memorandum","memorize","mentor","merchandise","merchant","merge","merger","merit","messenger","microphone","microscope","microwave","midnight","mild","mileage","mineral","mini","minimize","misidentify","mislead","misplace","mister","modem","modification","monument","morale","mosquito","motorcycle","mower","nail","nap","nationwide","neat","necessity","necklace","needy","newsletter","newsstand","noisy","nominate","nomination","noon","notify","nutrition","obligate","oblige","obtain","occupancy","occupant","occupation","occurrence","o'clock","officially","omit","ongoing","operational","opt","optimistic","optional","orchestra","organizational","organizer","orientation","outage","outdate","outdoor","outfit","outlet","outlook","outstanding","oval","oven","overcharge","overcrowd","overdue","overhead","overlook","overnight","overpay","oversee","overtime","overview","packet","pad","painter","pamphlet","pan","pant","paperback","paperwork","parade","paralegal","paraphrase","parcel","partial","partially","passport","password","pasta","pastry","patent","patience","patron","payable","paycheck","payroll","pedestrian","penalize","pepper","performer","periodical","periodically","permanently","personalize","pet","petition","pharmaceutical","pharmacist","pharmacy","photocopier","photocopy","photographer","photography","physician","physics","picnic","pie","pill","pillow","pizza","placement","planner","plausible","plow","plug","plumber","pole","polish","polite","pollute","poorly","popcorn","popularity","portable","portfolio","postage","postal","postcard","poster","postpone","pottery","precede","prediction","preliminary","premium","prescribe","prescription","presenter","prestigious","preview","probable","productive","productivity","professionally","proficiency","profitable","programmer","prohibit","projection","projector","prominent","promotional","promptly","proofread","prospective","protective","provider","publicity","publicize","publish","punctual","purchaser","purse","purser","puzzle","quarterly","query","questionnaire","quit","rack","railway","raincoat","rainfall","rainy","ray","realistic","realtor","rearrange","reassure","rebate","receipt","reception","receptionist","recession","recipe","recipient","reconsider","recreation","recreational","recruiter","recruitment","recur","recycle","redecorate","redesign","referee","referral","refinery","reflexive","refresh","refreshment","refrigerator","refund","refundable","rehearsal","rehearse","reimburse","reimbursement","reinforce","relaxation","reliability","relieve","relocate","relocation","reluctant","remainder","reminder","remodel","removal","renew","renewal","renovate","renovation","renown","rental","renter","reopen","repairperson","repeatedly","repetition","replacement","reproduce","reschedule","resemble","reservation","residence","residential","resignation","respondent","restatement","restroom","resume","résumé","retailer","retreat","retrieve","reunion","reviewer","revision","revolutionize","rewrite","rider","rose","rubber","rug","rumor","runner","safely","salad","salesman","salespeople","salesperson","salon","sandwich","satellite","satisfactory","sauna","scarf","scenery","scholarship","sculpture","seafood","seaside","seasonal","sedan","seeker","seldom","seller","semester","seminar","sender","separately","serial","sew","sewer","sharply","shipment","shopper","shortage","shorten","shortly","showroom","shuttle","sidewalk","sightsee","signature","signify","silently","similarity","simplify","sincerely","skate","skateboard","sketch","skim","sleepy","sleeve","slot","smartphone","smoothly","snack","snowy","soap","soar","soccer","sock","sofa","solar","someday","sometime","soup","spa","spacious","spam","specially","specialty","specification","spectator","spill","spite","spokesperson","spouse","spray","spreadsheet","stack","stadium","staple","stapler","stationery","statistics","statue","steadily","steak","steer","stereo","sticker","stimulus","stockbroker","stockholder","storeroom","strategic","streamline","strictly","stripe","submission","subscribe","subscriber","subscription","subsidize","substantially","subtract","suburb","subway","sue","suitcase","suite","sunny","sunscreen","sunshine","superb","superior","supermarket","supervise","supervisor","surf","suspicious","sweater","tablecloth","tablet","tactic","tag","tailor","takeover","taker","tasty","tech","technician","teen","telecommunication","teller","temporarily","tempt","tenant","terminal","terminate","termination","terrific","textbook","theft","thirsty","thorough","thoroughly","thrill","thunderstorm","tidy","tile","timeline","timely","timer","timetable","toiletry","toll","tomato","ton","toner","tow","towel","trademark","traditionally","trainee","trainer","transaction","transit","translation","translator","transmission","transmit","trash","traveler","tray","tremendous","tropical","tuition","tuna","tunnel","turnover","umbrella","unattended","unauthorize","unavailable","uncomfortable","underground","underline","underway","unemployed","unexpected","unfamiliar","unhappy","unlimited","unload","unnecessary","unpaid","unpleasant","unplug","unreal","unreliable","unspecified","unsure","unused","unusually","upcoming","upgrade","upstairs","urgent","urgently","usage","utility","vacancy","vacant","vacate","vacation","vacuum","valid","validate","vanilla","vase","vegetarian","vend","vendor","venue","verbal","verify","videoconference","violate","violation","violin","visa","vitamin","volleyball","voucher","waiter","waitress","waive","walkway","wallet","ward","warehouse","warranty","webpage","website","weekday","wellness","whale","wheelchair","whoever","wildlife","willingness","windy","wireless","wisely","withdrawal","wool","workbook","workforce","workplace","workshop","worldwide","worthwhile","wrinkle","wristwatch","yearly","yen","yoga","zoo"];

// Japanese translations for business/TOEIC key words
const JP = {
  "abide":"従う","aboard":"乗って","absent":"欠席の","absorb":"吸収する","accent":"アクセント",
  "acceptance":"受け入れ","accessible":"利用しやすい","accessory":"アクセサリー","acclaim":"称賛する",
  "accommodate":"収容する","accomplishment":"業績","accordingly":"それに応じて","accountant":"会計士",
  "accumulate":"蓄積する","accuracy":"正確さ","accurately":"正確に","accustom":"慣れさせる",
  "activate":"起動する","actively":"積極的に","actress":"女優","adapter":"アダプター",
  "additionally":"さらに","adhere":"付着する","adjacent":"隣接した","administer":"管理する",
  "administrative":"管理の","administrator":"管理者","admission":"入場","advancement":"昇進",
  "advertiser":"広告主","advisable":"賢明な","advisor":"顧問","advisory":"諮問の",
  "affirmative":"肯定的な","affordable":"手頃な","afterward":"その後","airfare":"航空運賃",
  "airplane":"飛行機","airport":"空港","aisle":"通路","alert":"警戒した","alike":"同様に",
  "allergy":"アレルギー","allocate":"割り当てる","alternate":"交互の","alternatively":"代わりに",
  "amateur":"アマチュア","ambassador":"大使","ambitious":"野心的な","amenity":"快適設備",
  "ample":"十分な","amuse":"楽しませる","anew":"新たに","anniversary":"記念日",
  "announcer":"アナウンサー","annoy":"悩ます","annually":"毎年","antique":"アンティーク",
  "anyhow":"とにかく","anytime":"いつでも","apology":"謝罪","appendix":"付録",
  "appetizer":"前菜","appliance":"電化製品","applicable":"適用できる","applicant":"応募者",
  "appraisal":"評価","appreciation":"感謝","apprehensive":"不安な","apprentice":"見習い",
  "approximate":"おおよその","architect":"建築家","architectural":"建築の","archive":"記録庫",
  "artistic":"芸術的な","aspect":"側面","assemble":"組み立てる","assembly":"会議",
  "assignment":"課題","assurance":"保証","athletic":"運動の","attain":"達成する",
  "attendant":"係員","attendee":"参加者","attire":"服装","attorney":"弁護士",
  "auction":"オークション","audit":"監査","audition":"オーディション","auditor":"監査役",
  "auditorium":"講堂","authentic":"本物の","authority":"権限","authorization":"認可",
  "authorize":"認可する","automate":"自動化する","automobile":"自動車","automotive":"自動車の",
  "availability":"利用可能性","await":"待つ",
  "backpack":"バックパック","bacteria":"細菌","badge":"バッジ","baggage":"手荷物",
  "balcony":"バルコニー","ballroom":"宴会場","banker":"銀行員","bankrupt":"破産した",
  "bankruptcy":"破産","banquet":"宴会","barbecue":"バーベキュー","bargain":"お買い得品",
  "basement":"地下室","beneficial":"有益な","beverage":"飲み物","biography":"伝記",
  "blueprint":"設計図","boardroom":"会議室","bonus":"ボーナス","booklet":"小冊子",
  "brainstorm":"ブレインストーミング","briefcase":"ブリーフケース","broaden":"広げる",
  "brochure":"パンフレット","broker":"ブローカー","browse":"閲覧する","buffet":"ビュッフェ",
  "bulletin":"掲示","businessman":"ビジネスマン","businessperson":"実業家",
  "by-law":"内部規則","cabinet":"キャビネット","café":"カフェ","cafeteria":"カフェテリア",
  "calculation":"計算","calculator":"電卓","calendar":"カレンダー","campus":"キャンパス",
  "cancellation":"キャンセル","candidate":"候補者","captain":"キャプテン","careless":"不注意な",
  "cargo":"貨物","carpenter":"大工","carrier":"運送業者","cartridge":"カートリッジ",
  "cashier":"レジ係","casual":"カジュアルな","cater":"料理を提供する","caterer":"仕出し業者",
  "caution":"注意","cautious":"慎重な","ceiling":"天井","celebrity":"有名人",
  "cellphone":"携帯電話","certificate":"証明書","certification":"認定","certify":"証明する",
  "chairperson":"議長","charitable":"慈善の","checkout":"チェックアウト","checkup":"健康診断",
  "chef":"シェフ","chilly":"肌寒い","chronic":"慢性的な","cinema":"映画館","circuit":"回路",
  "circulate":"循環する","circulation":"循環","clarify":"明確にする","classify":"分類する",
  "clerk":"店員","client":"顧客","clinic":"クリニック","closure":"閉鎖",
  "collaboration":"協力","collector":"収集家","commerce":"商業","commute":"通勤する",
  "commuter":"通勤者","compact":"コンパクトな","compartment":"区画","compatible":"互換性のある",
  "compensate":"補償する","compile":"編集する","completion":"完成","compliance":"コンプライアンス",
  "complication":"複雑化","compliment":"褒め言葉","complimentary":"無料の","comply":"従う",
  "comprehension":"理解","concierge":"コンシェルジェ","conditioner":"コンディショナー",
  "condominium":"マンション","conductor":"指揮者","conference":"会議","confidential":"機密の",
  "confirmation":"確認","conform":"従う","congestion":"混雑","congratulate":"祝う",
  "congratulation":"おめでとう","consecutive":"連続した","consent":"同意",
  "considerably":"かなり","considerate":"思いやりのある","consignment":"委託",
  "consistently":"一貫して","consultation":"相談","consumption":"消費","container":"容器",
  "contestant":"競技者","continental":"大陸の","contractor":"請負業者","contradict":"矛盾する",
  "contradiction":"矛盾","contrary":"反対の","convenience":"便利さ","convenient":"便利な",
  "conveniently":"便利に","convey":"伝える","cooperate":"協力する","coordinate":"調整する",
  "coordinator":"コーディネーター","copier":"コピー機","copyright":"著作権","cordless":"コードレスの",
  "correction":"訂正","correspondence":"通信","cosmetic":"化粧品","costly":"費用のかかる",
  "costume":"衣装","counselor":"カウンセラー","countryside":"田舎","coupon":"クーポン",
  "courier":"宅配便","courtesy":"礼儀","coworker":"同僚","creativity":"創造性",
  "criteria":"基準","cruise":"クルーズ","culinary":"料理の","cumulative":"累積の",
  "cushion":"クッション","customize":"カスタマイズする",
  "daytime":"昼間","deadline":"締め切り","dealership":"販売店","debit":"引き落とし",
  "decorate":"装飾する","decoration":"装飾","dedication":"献身","deduct":"差し引く",
  "deduction":"控除","defect":"欠陥","defective":"欠陥のある","definite":"明確な",
  "delegate":"委任する","delete":"削除する","delicate":"繊細な","delicious":"おいしい",
  "deluxe":"デラックスの","demolish":"取り壊す","dental":"歯の","dentist":"歯科医",
  "depart":"出発する","departmental":"部門の","departure":"出発","dependable":"信頼できる",
  "dependence":"依存","designate":"指定する","desirable":"望ましい","desktop":"デスクトップ",
  "desperate":"必死な","dessert":"デザート","destination":"目的地","detach":"取り外す",
  "deteriorate":"悪化する","devastate":"壊滅させる","developer":"開発者","diagnose":"診断する",
  "diagnostic":"診断の","diagram":"図","diamond":"ダイヤモンド","dine":"食事する",
  "diner":"食堂","diploma":"卒業証書","directory":"名簿","disable":"無効にする",
  "disagreement":"意見の相違","disappointment":"失望","discard":"捨てる","disconnect":"切断する",
  "discontinue":"中止する","discrepancy":"食い違い","dispatch":"発送する","disposal":"処分",
  "dispose":"処分する","disrupt":"混乱させる","disruption":"混乱","distribution":"配布",
  "distributor":"販売代理店","dividend":"配当金","dock":"波止場","documentary":"ドキュメンタリー",
  "documentation":"文書化","donate":"寄付する","donation":"寄付","doorman":"ドアマン",
  "dose":"用量","download":"ダウンロードする","downsize":"縮小する","downtown":"繁華街",
  "downturn":"景気後退","drawback":"欠点","drill":"ドリル","durable":"耐久性のある",
  "duration":"期間","dynamic":"ダイナミックな",
  "eager":"熱心な","earthquake":"地震","economical":"経済的な","economist":"経済学者",
  "economize":"節約する","editorial":"社説","effectiveness":"有効性","efficiently":"効率的に",
  "electrical":"電気の","electrician":"電気技師","elegant":"エレガントな","elevate":"高める",
  "elevator":"エレベーター","eligible":"資格のある","embassy":"大使館","embed":"埋め込む",
  "enclose":"同封する","energetic":"精力的な","engagement":"約束","enjoyable":"楽しい",
  "enroll":"登録する","enrollment":"登録","enthusiasm":"熱意","enthusiast":"熱狂者",
  "enthusiastic":"熱心な","entrepreneur":"起業家","equip":"装備する","erase":"消す",
  "escalator":"エスカレーター","escort":"付き添う","ethics":"倫理","evacuate":"避難する",
  "evident":"明らかな","excellence":"優秀さ","exceptional":"例外的な","excessive":"過度な",
  "exclusive":"独占的な","excursion":"遠足","exemption":"免除","exotic":"エキゾチックな",
  "expedite":"促進する","expertise":"専門知識","expiration":"期限切れ","expire":"期限が切れる",
  "extinguisher":"消火器","fabric":"生地","facilitate":"促進する","factual":"事実の",
  "faculty":"教職員","familiarity":"親しみ","familiarize":"慣れさせる","fare":"運賃",
  "farewell":"別れ","fasten":"固定する","fatigue":"疲労","faulty":"欠陥のある",
  "favorable":"好意的な","feedback":"フィードバック","ferry":"フェリー","finalize":"最終決定する",
  "firefighter":"消防士","fiscal":"会計の","fitness":"フィットネス","fixture":"備品",
  "flavor":"風味","flaw":"欠点","fleet":"車両群","flexibility":"柔軟性","flextime":"フレックスタイム",
  "fluctuate":"変動する","fluent":"流暢な","flyer":"チラシ","folder":"フォルダー",
  "footwear":"履物","forbid":"禁止する","foreman":"工場長","formally":"正式に",
  "fortunately":"幸いに","forum":"フォーラム","foster":"育てる","founder":"創設者",
  "fountain":"噴水","franchise":"フランチャイズ","freelance":"フリーランス","freight":"貨物",
  "freighter":"貨物船","frustrate":"挫折させる","fundraise":"募金活動をする","furnish":"備え付ける",
  "gallon":"ガロン","garage":"ガレージ","garbage":"ゴミ","gardener":"庭師","garment":"衣類",
  "gasoline":"ガソリン","generator":"発電機","generic":"一般的な","generous":"寛大な",
  "genre":"ジャンル","getaway":"逃避","glove":"手袋","goods":"商品","gossip":"うわさ話",
  "graduation":"卒業","graph":"グラフ","graphic":"グラフィック","grill":"グリルで焼く",
  "grocery":"食料品","guidance":"指導","gym":"ジム","gymnasium":"体育館",
  "habitual":"習慣的な","hacker":"ハッカー","hallway":"廊下","handbook":"手引き書",
  "handy":"便利な","hardware":"ハードウェア","hardworking":"勤勉な","harmful":"有害な",
  "hazard":"危険","hazardous":"危険な","headache":"頭痛","headphone":"ヘッドフォン",
  "headquarter":"本社","healthcare":"医療","healthful":"健康的な","heater":"ヒーター",
  "helmet":"ヘルメット","hereby":"これにより","hesitant":"ためらいがちな","hesitation":"ためらい",
  "highway":"高速道路","hike":"ハイキング","hiker":"ハイカー","hobby":"趣味",
  "homeless":"ホームレス","homemade":"手作りの","homeowner":"家主","honestly":"正直に",
  "hospitality":"おもてなし","hotline":"ホットライン","hourly":"毎時の","housekeeper":"家政婦",
  "humidity":"湿度","hurricane":"ハリケーン","hygiene":"衛生",
  "ideally":"理想的には","identification":"身分証明","immigration":"移民","impact":"影響",
  "impatient":"せっかちな","imperative":"必須の","inappropriate":"不適切な","inclusive":"包括的な",
  "incoming":"到着する","inconvenience":"不便","incur":"招く","indicator":"指標",
  "individually":"個別に","indoor":"室内の","inefficient":"非効率な","inexpensive":"安価な",
  "infer":"推論する","inflate":"膨らませる","influential":"影響力のある","informal":"非公式の",
  "informative":"情報豊富な","ingredient":"材料","innovative":"革新的な","inquire":"問い合わせる",
  "inspect":"検査する","inspection":"検査","inspector":"検査官","inspiration":"インスピレーション",
  "installation":"設置","institute":"機関","instruct":"指示する","instructor":"インストラクター",
  "insufficient":"不十分な","integral":"不可欠な","interactive":"対話型の","interfere":"干渉する",
  "intern":"インターン","internet":"インターネット","internship":"インターンシップ",
  "interpreter":"通訳者","interrupt":"中断する","intersection":"交差点","introductory":"入門の",
  "invaluable":"非常に貴重な","invention":"発明","inventory":"在庫","invoice":"請求書",
  "irregular":"不規則な","irrelevant":"無関係な","irritate":"苛立てる","itinerary":"旅程",
  "journalism":"ジャーナリズム","junior":"下位の","keyboard":"キーボード","kilogram":"キログラム",
  "kilometer":"キロメートル","kit":"キット","knowledgeable":"知識のある",
  "ladder":"はしご","lamp":"ランプ","landlord":"大家","lane":"車線","laptop":"ノートパソコン",
  "lately":"最近","laundry":"洗濯","lawn":"芝生","layoff":"解雇","layout":"レイアウト",
  "leak":"漏れる","lease":"賃貸する","lecturer":"講師","leisure":"余暇","lengthy":"長い",
  "letterhead":"レターヘッド","librarian":"司書","lifeguard":"ライフガード","lifestyle":"ライフスタイル",
  "lifetime":"生涯","lobby":"ロビー","locally":"地元で","locker":"ロッカー","logical":"論理的な",
  "logo":"ロゴ","lounge":"ラウンジ","loyal":"忠実な","loyalty":"忠誠心","luggage":"荷物",
  "luncheon":"昼食会","machinery":"機械","malfunction":"誤作動","managerial":"管理の",
  "mandatory":"義務的な","manual":"手動の","massage":"マッサージ","maximize":"最大化する",
  "meaningful":"意味のある","mechanic":"整備士","mechanical":"機械の","medication":"薬",
  "memo":"メモ","memorandum":"覚書","memorize":"暗記する","mentor":"メンター",
  "merchandise":"商品","merchant":"商人","merge":"合併する","merger":"合併","merit":"長所",
  "messenger":"メッセンジャー","microphone":"マイク","microwave":"電子レンジ","mileage":"走行距離",
  "mineral":"ミネラル","minimize":"最小化する","mislead":"誤解させる","modem":"モデム",
  "modification":"修正","monument":"記念碑","morale":"士気","motorcycle":"オートバイ",
  "nationwide":"全国的な","necessity":"必要性","necklace":"ネックレス","newsletter":"ニュースレター",
  "nominate":"推薦する","nomination":"推薦","notify":"通知する","nutrition":"栄養",
  "obligate":"義務付ける","obtain":"得る","occupancy":"占有","occupant":"居住者",
  "occupation":"職業","officially":"公式に","omit":"省略する","ongoing":"継続中の",
  "operational":"運営の","optimistic":"楽観的な","optional":"任意の","orchestra":"オーケストラ",
  "organizational":"組織の","organizer":"主催者","orientation":"オリエンテーション",
  "outage":"停電","outdoor":"屋外の","outfit":"服装","outlet":"コンセント","outlook":"見通し",
  "outstanding":"優れた","oven":"オーブン","overcharge":"過剰請求する","overdue":"期限超過の",
  "overhead":"諸経費","overlook":"見落とす","overnight":"一夜の","oversee":"監督する",
  "overtime":"時間外労働","overview":"概要","packet":"パケット","pamphlet":"パンフレット",
  "paperwork":"書類仕事","parade":"パレード","paralegal":"法律補助員","parcel":"小包",
  "partial":"部分的な","partially":"部分的に","passport":"パスポート","password":"パスワード",
  "pasta":"パスタ","pastry":"ペストリー","patent":"特許","patience":"忍耐","patron":"後援者",
  "payable":"支払うべき","paycheck":"給料","payroll":"給与名簿","pedestrian":"歩行者",
  "penalize":"罰する","performer":"演奏者","periodical":"定期刊行物","periodically":"定期的に",
  "permanently":"永久に","personalize":"パーソナライズする","petition":"請願","pharmaceutical":"薬剤の",
  "pharmacist":"薬剤師","pharmacy":"薬局","photographer":"写真家","photography":"写真撮影",
  "physician":"内科医","placement":"配置","planner":"企画者","plausible":"もっともらしい",
  "plumber":"配管工","pollute":"汚染する","popularity":"人気","portable":"携帯用の",
  "portfolio":"ポートフォリオ","postage":"郵便料金","postal":"郵便の","postcard":"はがき",
  "postpone":"延期する","pottery":"陶芸","precede":"先行する","prediction":"予測",
  "preliminary":"予備の","premium":"プレミアムの","prescribe":"処方する","prescription":"処方箋",
  "presenter":"発表者","prestigious":"一流の","preview":"試写","probable":"ありそうな",
  "productive":"生産的な","productivity":"生産性","professionally":"専門的に","proficiency":"熟練",
  "profitable":"利益を生む","programmer":"プログラマー","prohibit":"禁止する","projection":"予測",
  "projector":"プロジェクター","prominent":"著名な","promotional":"宣伝の","promptly":"迅速に",
  "proofread":"校正する","prospective":"見込みのある","protective":"保護的な","provider":"提供者",
  "publicity":"宣伝","publicize":"公表する","publish":"出版する","punctual":"時間を守る",
  "purchaser":"購入者","puzzle":"パズル","quarterly":"四半期ごとの","query":"問い合わせ",
  "questionnaire":"アンケート","quit":"辞める","rack":"ラック","railway":"鉄道",
  "raincoat":"レインコート","realistic":"現実的な","realtor":"不動産業者","rearrange":"再配置する",
  "reassure":"安心させる","rebate":"リベート","receipt":"領収書","reception":"レセプション",
  "receptionist":"受付係","recession":"景気後退","recipe":"レシピ","recipient":"受取人",
  "reconsider":"再考する","recreation":"レクリエーション","recreational":"娯楽の","recruiter":"採用担当者",
  "recruitment":"採用","recur":"再発する","recycle":"リサイクルする","redecorate":"模様替えする",
  "redesign":"再設計する","referee":"審判","referral":"紹介","refrigerator":"冷蔵庫",
  "refund":"返金","refundable":"払い戻し可能な","rehearsal":"リハーサル","rehearse":"リハーサルする",
  "reimburse":"払い戻す","reimbursement":"払い戻し","reinforce":"強化する","relaxation":"リラクゼーション",
  "reliability":"信頼性","relieve":"和らげる","relocate":"移転する","relocation":"移転",
  "reluctant":"気が進まない","remainder":"残り","reminder":"リマインダー","remodel":"リモデルする",
  "removal":"除去","renew":"更新する","renewal":"更新","renovate":"改修する","renovation":"改修",
  "renown":"名声","rental":"レンタル","renter":"借り主","replacement":"交換","reschedule":"再スケジュールする",
  "reservation":"予約","residence":"住居","residential":"住宅の","resignation":"辞表",
  "restroom":"トイレ","resume":"再開する","résumé":"履歴書","retailer":"小売業者","retreat":"後退する",
  "retrieve":"取り出す","reunion":"再会","revision":"改訂","revolutionize":"革命を起こす",
  "safely":"安全に","salad":"サラダ","salesman":"セールスマン","salesperson":"販売員","salon":"サロン",
  "sandwich":"サンドイッチ","satellite":"衛星","satisfactory":"満足な","scenery":"風景",
  "scholarship":"奨学金","sculpture":"彫刻","seafood":"海産物","seasonal":"季節の","sedan":"セダン",
  "seldom":"めったに〜しない","semester":"学期","seminar":"セミナー","separately":"別々に",
  "shipment":"出荷","shopper":"買い物客","shortage":"不足","shorten":"短くする","showroom":"展示室",
  "shuttle":"シャトル","sidewalk":"歩道","signature":"署名","signify":"意味する","similarity":"類似点",
  "simplify":"簡単にする","sincerely":"誠実に","smartphone":"スマートフォン","smoothly":"スムーズに",
  "soar":"急上昇する","spacious":"広々とした","specialty":"専門","specification":"仕様書",
  "spectator":"観客","spokesperson":"広報担当者","spouse":"配偶者","spreadsheet":"スプレッドシート",
  "stadium":"スタジアム","staple":"ステープル","stapler":"ホッチキス","stationery":"文房具",
  "statistics":"統計","statue":"彫像","steadily":"着実に","steer":"操舵する","stereo":"ステレオ",
  "stimulus":"刺激","stockbroker":"株式仲買人","stockholder":"株主","storeroom":"倉庫",
  "strategic":"戦略的な","streamline":"合理化する","strictly":"厳密に","submission":"提出",
  "subscribe":"購読する","subscriber":"購読者","subscription":"購読","subsidize":"助成する",
  "substantially":"実質的に","subtract":"引き算する","suburb":"郊外","subway":"地下鉄","sue":"訴える",
  "suitcase":"スーツケース","suite":"スイートルーム","superb":"素晴らしい","superior":"優れた",
  "supermarket":"スーパーマーケット","supervise":"監督する","supervisor":"上司","surf":"サーフィンする",
  "suspicious":"疑わしい","tablecloth":"テーブルクロス","tablet":"タブレット","tactic":"戦術",
  "tailor":"仕立て屋","takeover":"買収","tasty":"おいしい","technician":"技術者",
  "telecommunication":"電気通信","teller":"銀行窓口係","temporarily":"一時的に","tempt":"誘惑する",
  "tenant":"借家人","terminal":"ターミナル","terminate":"終了する","termination":"終了",
  "terrific":"素晴らしい","textbook":"教科書","theft":"窃盗","thorough":"徹底的な",
  "thoroughly":"徹底的に","thrill":"スリル","tidy":"きちんとした","timeline":"タイムライン",
  "timely":"タイムリーな","timetable":"時刻表","toiletry":"トイレ用品","toll":"通行料",
  "ton":"トン","trademark":"商標","traditionally":"伝統的に","trainee":"研修生","trainer":"トレーナー",
  "transaction":"取引","transit":"輸送","translation":"翻訳","translator":"翻訳者",
  "transmission":"送信","transmit":"送信する","trash":"ゴミ","traveler":"旅行者","tremendous":"巨大な",
  "tropical":"熱帯の","tuition":"授業料","tunnel":"トンネル","turnover":"売上高",
  "umbrella":"傘","unavailable":"利用不可","uncomfortable":"不快な","underground":"地下の",
  "underway":"進行中","unemployed":"失業した","unexpected":"予期しない","unfamiliar":"不慣れな",
  "unlimited":"無制限の","unload":"荷降ろしする","unnecessary":"不必要な","unpaid":"未払いの",
  "unpleasant":"不快な","upgrade":"アップグレードする","urgent":"緊急の","urgently":"緊急に",
  "usage":"使用法","utility":"公共料金","vacancy":"空き","vacant":"空いている","vacate":"退去する",
  "vacation":"休暇","valid":"有効な","validate":"検証する","vegetarian":"ベジタリアン",
  "vendor":"ベンダー","venue":"会場","verbal":"口頭の","verify":"確認する",
  "videoconference":"ビデオ会議","violate":"違反する","violation":"違反","visa":"ビザ",
  "vitamin":"ビタミン","voucher":"バウチャー","waiter":"ウェイター","waitress":"ウェイトレス",
  "waive":"放棄する","walkway":"通路","wallet":"財布","warehouse":"倉庫","warranty":"保証",
  "webpage":"ウェブページ","website":"ウェブサイト","weekday":"平日","wellness":"健康",
  "wheelchair":"車椅子","wildlife":"野生動物","willingness":"意欲","wireless":"ワイヤレスの",
  "wisely":"賢明に","withdrawal":"引き出し","workbook":"ワークブック","workforce":"労働力",
  "workplace":"職場","workshop":"ワークショップ","worldwide":"世界的な","worthwhile":"価値ある",
  "wrinkle":"しわ","wristwatch":"腕時計","yoga":"ヨガ","zoo":"動物園",
  // extras
  "balloon":"風船","baker":"パン職人","bakery":"パン屖","bean":"豆","beforehand":"事前に",
  "beginner":"初心者","behalf":"代わり","bench":"ベンチ","bicycle":"自転車","blanket":"毛布",
  "bookcase":"本棚","bookstore":"書店","booth":"ブース","bound":"向かう","broom":"ほうき",
  "bulb":"電球","bulk":"大量","butter":"バター","cab":"タクシー","cabin":"客室",
  "calendar":"カレンダー","caller":"電話をかける人","candy":"キャンディー","carrier":"運送業者",
  "cart":"カート","carton":"箱","ceiling":"天井","centimeter":"センチメートル","cheer":"応援する",
  "chemistry":"化学","cinema":"映画館","clap":"拍手する","classmate":"クラスメート",
  "cleaner":"掃除機","cleanliness":"清潔さ","click":"クリックする","clip":"クリップ",
  "closet":"クローゼット","cloth":"布","cloudy":"曇りの","clue":"手がかり","colorful":"カラフルな",
  "comb":"くし","comfortably":"快適に","commonly":"一般的に","compact":"コンパクトな",
  "cookbook":"料理本","cookie":"クッキー","cooler":"クーラー","cord":"コード","cordless":"コードレスの",
  "correctly":"正確に","costume":"衣装","coupon":"クーポン","crane":"クレーン",
  "daytime":"昼間","deck":"デッキ","delete":"削除する","delicious":"おいしい","deluxe":"豪華な",
  "dental":"歯の","dine":"食事する","diner":"食堂","diploma":"卒業証書","directory":"住所録",
  "dock":"ドック","doorman":"ドアマン","dose":"投与量","download":"ダウンロード",
  "downstairs":"階下に","downtown":"繁華街","drawer":"引き出し","drill":"ドリル","drum":"ドラム",
  "dull":"退屈な","duplicate":"複製する","eager":"熱心な","e-book":"電子書籍",
  "elephant":"象","embassy":"大使館","embed":"埋め込む","enclose":"囲む","euro":"ユーロ",
  "exit":"出口","fabric":"生地","fog":"霧","folder":"フォルダー","fork":"フォーク",
  "fry":"揚げる","gum":"ガム","gym":"ジム","hamburger":"ハンバーガー","hardware":"ハードウェア",
  "headphone":"ヘッドフォン","helmet":"ヘルメット","highway":"高速道路","hobby":"趣味",
  "homework":"宿題","hotline":"ホットライン","ice cream":"アイスクリーム","icy":"氷の張った",
  "illogical":"非論理的な","immigration":"出入国管理","ink":"インク","intersection":"交差点",
  "jam":"渋滞","jazz":"ジャズ","jeans":"ジーンズ","jet":"ジェット機","jewelry":"宝石",
  "jog":"ジョギングする","juice":"ジュース","junk":"ガラクタ","kilogram":"キログラム",
  "kit":"キット","lamp":"ランプ","lane":"車線","laundry":"洗濯","lawn":"芝生",
  "lighter":"ライター","lightweight":"軽量の","liter":"リットル","locker":"ロッカー",
  "login":"ログイン","logo":"ロゴ","loudly":"大声で","loyal":"忠実な","luggage":"荷物",
  "lunchtime":"昼食時間","mall":"ショッピングモール","mask":"マスク","meantime":"その間",
  "media":"メディア","memo":"メモ","microphone":"マイク","midnight":"真夜中","mild":"穏やかな",
  "mineral":"鉱物","mini":"ミニ","misidentify":"誤認する","mister":"〜さん","modem":"モデム",
  "mosquito":"蚊","mower":"芝刈り機","nail":"釘","nap":"仮眠","neat":"きちんとした",
  "necklace":"ネックレス","needy":"困窮した","newsstand":"売店","noisy":"騒がしい","noon":"正午",
  "nutrition":"栄養","o'clock":"〜時","opt":"選ぶ","oval":"楕円形の","oven":"オーブン",
  "overnight":"一晩","packet":"パケット","pad":"パッド","painter":"画家","pan":"フライパン",
  "pant":"あえぐ","paperback":"ペーパーバック","pasta":"パスタ","pastry":"ペストリー",
  "patent":"特許","patron":"常連客","payroll":"給与","pepper":"胡椒","pet":"ペット",
  "picnic":"ピクニック","pie":"パイ","pill":"錠剤","pillow":"枕","pizza":"ピザ",
  "plow":"鋤く","plug":"プラグ","pole":"柱","polish":"磨く","polite":"礼儀正しい",
  "poorly":"下手に","popcorn":"ポップコーン","porter":"ポーター","postcard":"はがき",
  "pottery":"陶芸","ray":"光線","realistic":"現実的な","recipe":"レシピ","recreation":"娯楽",
  "rose":"バラ","rubber":"ゴム","rug":"ラグ","rumor":"うわさ","runner":"ランナー",
  "salad":"サラダ","sauna":"サウナ","scarf":"スカーフ","sculptor":"彫刻家","sock":"靴下",
  "sofa":"ソファ","solar":"太陽の","someday":"いつか","sometime":"いつか","soup":"スープ",
  "spa":"スパ","spam":"スパム","spray":"スプレー","stack":"積み重ねる","staple":"主要な",
  "steak":"ステーキ","sticker":"ステッカー","stripe":"縞","subway":"地下鉄","sunny":"晴れた",
  "sunscreen":"日焼け止め","sunshine":"日光","surf":"サーフィン","sweater":"セーター",
  "tag":"タグ","teen":"十代の","tidy":"きれいな","tile":"タイル","timer":"タイマー",
  "toiletry":"洗面用具","tomato":"トマト","toner":"トナー","tow":"牽引する","towel":"タオル",
  "trash":"ゴミ","tray":"トレー","tuna":"マグロ","umbrella":"傘","vanilla":"バニラ",
  "vase":"花瓶","violin":"バイオリン","vitamin":"ビタミン","volleyball":"バレーボール",
  "walkway":"通路","wallet":"財布","whale":"クジラ","wool":"ウール","wrinkle":"しわ",
  "yearly":"毎年の","yen":"円","yoga":"ヨガ"
};

const PROGRESS_FILE = path.join(__dirname, '..', 'data', '.toeic-build-progress.json');
const OUTPUT_FILE   = path.join(__dirname, '..', 'data', 'toeic.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchDefinition(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
            resolve(data[0].meanings[0].definitions[0].definition);
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  let progress = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
    catch { progress = {}; }
    console.log(`Resuming: ${Object.keys(progress).length} words already done`);
  }

  const total = WORDS.length;
  let saved = 0;

  for (let i = 0; i < total; i++) {
    const word = WORDS[i];
    if (progress[word]) { saved++; continue; }

    process.stdout.write(`[${i+1}/${total}] ${word} ... `);
    const def = await fetchDefinition(word);
    progress[word] = def || '';
    console.log(def ? def.slice(0, 60) : '(no definition)');
    saved++;

    if (saved % 50 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
      console.log(`  ✓ Progress saved (${saved} done)`);
    }
    await sleep(200);
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));

  // Build final JSON
  const words = WORDS.map((word, i) => {
    const level = i < 420 ? 1 : i < 840 ? 2 : 3;
    const translation = JP[word] || '';
    const definition = progress[word] || '';
    return {
      id: `tsl${String(i+1).padStart(4,'0')}`,
      word,
      translation,
      definition,
      level
    };
  });

  const output = {
    category: 'toeic',
    credit: 'TOEIC Service List v1.1 — Browne, C. & Culligan, B. (2016). CC BY-SA 4.0. http://www.newgeneralservicelist.org',
    words
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! ${words.length} words written to data/toeic.json`);

  fs.unlinkSync(PROGRESS_FILE);
}

main().catch(console.error);
