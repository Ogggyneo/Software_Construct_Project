import { useState } from 'react';
import { ChevronRight, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';


import img1 from './images/1.jpg';
import img2 from './images/2.jpg';
import img3 from './images/3.jpg';
import img4 from './images/4.jpg';
import img5 from './images/5.jpg';
import img6 from './images/6.jpg';
import img7 from './images/7.jpg';
import img8 from './images/8.jpg';
import img9 from './images/9.png';
import img10 from './images/10.jpg';
import img11 from './images/11.jpg';
import img12 from './images/12.jpg';
import img13 from './images/13.jpg';
import img14 from './images/14.jpg';
import img15 from './images/15.jpg';
import img16 from './images/16.jpg';
import img17 from './images/17.png';
import img18 from './images/18.jpg';
import img19 from './images/19.jpg';
import img20 from './images/20.jpg';
import img21 from './images/21.jpg';

export type Recipe = {
  id: number;
  name: string;
  category: string;
  image: string;
  time: string;
  calories: string;
  badge?: string;
  description: string;
  servings: string;
  ingredients: string[];
  steps: string[];
};

const recipes: Recipe[] = [
  {
    id: 1,
    name: 'Salad Ức Gà Nướng & Hạt Điều',
    category: 'Healthy',
    image: img1,
    time: '20 phút',
    calories: '350 kcal',
    badge: 'Healthy',
    description: 'Món salad thanh nhẹ với ức gà nướng mềm, rau tươi và hạt điều giòn béo.',
    servings: '2 người',
    ingredients: [
      '200g ức gà',
      '100g xà lách',
      '50g cà chua bi',
      '30g hạt điều rang',
      '1/2 quả dưa leo',
      '1 muỗng canh dầu olive',
      '1 muỗng cà phê mật ong',
      '1 muỗng cà phê nước cốt chanh',
      'Muối, tiêu',
    ],
    steps: [
      'Ướp ức gà với muối, tiêu và một ít dầu olive trong 10 phút.',
      'Nướng hoặc áp chảo ức gà đến khi chín đều, sau đó cắt lát.',
      'Rửa sạch xà lách, dưa leo và cà chua bi, để ráo.',
      'Pha sốt gồm dầu olive, mật ong, nước cốt chanh và chút muối.',
      'Cho rau ra đĩa, xếp gà lên trên, rắc hạt điều rang và rưới sốt trước khi dùng.',
    ],
  },
  {
    id: 2,
    name: 'Mì Ý Sốt Cà Chua',
    category: 'Italian',
    image: img2,
    time: '25 phút',
    calories: '420 kcal',
    badge: 'Popular',
    description: 'Mì Ý sốt cà chua đơn giản, chua nhẹ, thơm mùi cà chua và tỏi.',
    servings: '2 người',
    ingredients: [
      '200g mì spaghetti',
      '3 quả cà chua chín hoặc 150g sốt cà chua',
      '2 tép tỏi băm',
      '1/2 củ hành tây',
      '1 muỗng canh dầu olive',
      'Muối, tiêu',
      'Lá basil hoặc ngò tây',
    ],
    steps: [
      'Luộc mì trong nước sôi có muối đến khi chín vừa, vớt ra để ráo.',
      'Phi thơm tỏi và hành tây với dầu olive.',
      'Cho cà chua cắt nhỏ hoặc sốt cà chua vào chảo, nêm muối tiêu.',
      'Đun nhỏ lửa 5–7 phút để sốt sệt lại.',
      'Cho mì vào đảo đều với sốt, rắc basil hoặc ngò tây rồi dùng nóng.',
    ],
  },
  {
    id: 3,
    name: 'Phở Bò Tái Lăn',
    category: 'Asian',
    image: img3,
    time: '30 phút',
    calories: '480 kcal',
    badge: 'Vietnamese',
    description: 'Phở bò tái lăn thơm mùi gừng, hành và thịt bò xào tái đậm vị.',
    servings: '2 người',
    ingredients: [
      '200g bánh phở',
      '200g thịt bò thái mỏng',
      '1 lít nước dùng bò',
      '1 củ hành tây',
      'Gừng, hành tím',
      'Hành lá, ngò rí',
      'Gia vị: nước mắm, muối, tiêu',
    ],
    steps: [
      'Trụng bánh phở qua nước sôi rồi chia vào tô.',
      'Phi thơm gừng và hành tím, cho bò vào xào nhanh trên lửa lớn.',
      'Đun sôi nước dùng, nêm vừa ăn.',
      'Cho bò tái lăn lên trên bánh phở.',
      'Chan nước dùng nóng, thêm hành lá, ngò rí và hành tây rồi dùng ngay.',
    ],
  },
  {
    id: 4,
    name: 'Sushi Cá Hồi Tươi',
    category: 'Japanese',
    image: img4,
    time: '20 phút',
    calories: '320 kcal',
    badge: 'Fresh',
    description: 'Sushi cá hồi tươi với cơm dẻo, vị thanh nhẹ, thích hợp cho bữa ăn nhanh.',
    servings: '2 người',
    ingredients: [
      '200g cơm sushi',
      '150g cá hồi tươi',
      '2 lá rong biển',
      '1 muỗng canh giấm gạo',
      '1 muỗng cà phê đường',
      '1/2 muỗng cà phê muối',
      'Dưa leo hoặc bơ',
      'Nước tương, wasabi',
    ],
    steps: [
      'Trộn cơm với giấm gạo, đường và muối, để nguội.',
      'Cắt cá hồi thành lát vừa ăn.',
      'Trải rong biển lên mành cuốn, dàn đều cơm lên trên.',
      'Xếp cá hồi và dưa leo hoặc bơ vào giữa rồi cuộn chặt.',
      'Cắt thành khoanh nhỏ, dùng kèm nước tương và wasabi.',
    ],
  },
  {
    id: 5,
    name: 'Bánh Mì Kẹp Thịt',
    category: 'Street Food',
    image: img5,
    time: '15 phút',
    calories: '430 kcal',
    badge: 'Street Food',
    description: 'Bánh mì giòn vỏ, nhân thịt đậm đà, rau dưa chua và nước sốt hấp dẫn.',
    servings: '1 người',
    ingredients: [
      '1 ổ bánh mì',
      '100g thịt nướng hoặc chả lụa',
      'Dưa leo',
      'Đồ chua cà rốt củ cải',
      'Rau ngò',
      'Mayonnaise',
      'Nước tương hoặc pate',
    ],
    steps: [
      'Rạch bánh mì và làm nóng nhẹ trong lò hoặc áp chảo.',
      'Phết pate hoặc mayonnaise vào bên trong bánh.',
      'Cho thịt, dưa leo, đồ chua và rau ngò vào bánh.',
      'Thêm nước tương hoặc sốt tùy thích.',
      'Ép nhẹ ổ bánh và dùng ngay khi còn giòn.',
    ],
  },
  {
    id: 6,
    name: 'Bún Chả Hà Nội',
    category: 'Vietnamese',
    image: img6,
    time: '30 phút',
    calories: '500 kcal',
    badge: 'Vietnamese',
    description: 'Bún chả Hà Nội với thịt nướng thơm, nước chấm chua ngọt và rau sống tươi.',
    servings: '2 người',
    ingredients: [
      '200g bún tươi',
      '200g thịt heo xay',
      '200g thịt ba chỉ',
      'Tỏi, hành tím',
      'Nước mắm, đường, giấm',
      'Đu đủ xanh hoặc cà rốt',
      'Rau sống',
    ],
    steps: [
      'Ướp thịt xay và thịt ba chỉ với tỏi, hành, nước mắm, đường.',
      'Nướng thịt đến khi vàng thơm.',
      'Pha nước chấm chua ngọt, thêm đu đủ xanh hoặc cà rốt ngâm.',
      'Cho bún ra tô hoặc đĩa, ăn kèm rau sống.',
      'Dùng thịt nướng với nước chấm và bún.',
    ],
  },
  {
    id: 7,
    name: 'Pizza Hải Sản',
    category: 'Italian',
    image: img7,
    time: '35 phút',
    calories: '550 kcal',
    badge: 'Cheesy',
    description: 'Pizza hải sản với phô mai kéo sợi, topping tôm mực đậm vị.',
    servings: '2–3 người',
    ingredients: [
      '1 đế pizza',
      '100g tôm',
      '100g mực',
      '100g phô mai mozzarella',
      '3 muỗng canh sốt cà chua',
      '1/2 củ hành tây',
      'Ớt chuông',
      'Oregano',
    ],
    steps: [
      'Làm nóng lò ở 200°C.',
      'Phết sốt cà chua lên đế pizza.',
      'Xếp tôm, mực, hành tây và ớt chuông lên trên.',
      'Rải phô mai đều khắp mặt bánh.',
      'Nướng 12–15 phút đến khi phô mai chảy vàng, rắc oregano rồi dùng.',
    ],
  },
  {
    id: 8,
    name: 'Tacos Tôm Nướng',
    category: 'Mexican',
    image: img8,
    time: '20 phút',
    calories: '390 kcal',
    badge: 'Mexican',
    description: 'Tacos với tôm nướng thơm, rau củ tươi và sốt chua nhẹ.',
    servings: '2 người',
    ingredients: [
      '6 vỏ tacos',
      '200g tôm',
      'Xà lách tím',
      'Cà chua',
      'Bắp hạt',
      '1 quả chanh',
      'Sốt mayonnaise hoặc yogurt',
      'Muối, tiêu, paprika',
    ],
    steps: [
      'Ướp tôm với muối, tiêu, paprika và nước cốt chanh.',
      'Áp chảo hoặc nướng tôm đến khi chín.',
      'Làm nóng vỏ tacos.',
      'Cho xà lách, cà chua, bắp và tôm vào tacos.',
      'Rưới sốt lên trên và dùng ngay.',
    ],
  },
  {
    id: 9,
    name: 'Cơm Tấm',
    category: 'Vietnamese',
    image: img9,
    time: '30 phút',
    calories: '560 kcal',
    badge: 'Vietnamese',
    description: 'Cơm tấm sườn nướng ăn kèm bì, chả và nước mắm chua ngọt.',
    servings: '2 người',
    ingredients: [
      '2 chén cơm tấm',
      '2 miếng sườn heo',
      '1 quả trứng',
      'Bì hoặc chả trứng',
      'Dưa leo, cà chua',
      'Nước mắm, đường, tỏi, ớt',
    ],
    steps: [
      'Ướp sườn với tỏi, đường, nước mắm rồi nướng hoặc áp chảo.',
      'Nấu cơm tấm chín.',
      'Chiên trứng ốp la nếu thích.',
      'Pha nước mắm chua ngọt.',
      'Dọn cơm với sườn, bì/chả, trứng và rau ăn kèm.',
    ],
  },
  {
    id: 10,
    name: 'Bún Bò Huế',
    category: 'Vietnamese',
    image: img10,
    time: '40 phút',
    calories: '520 kcal',
    badge: 'Spicy',
    description: 'Bún bò Huế đậm đà, cay nhẹ, thơm mùi sả và ruốc.',
    servings: '2 người',
    ingredients: [
      '200g bún bò',
      '200g thịt bò',
      'Giò heo hoặc chả cua',
      '1.2 lít nước dùng',
      'Sả, ớt, hành tím',
      'Ruốc Huế',
      'Rau sống',
    ],
    steps: [
      'Đun nước dùng với sả và ruốc Huế để tạo mùi thơm đặc trưng.',
      'Luộc bò và giò heo đến chín rồi cắt miếng.',
      'Trụng bún và cho vào tô.',
      'Xếp thịt lên trên rồi chan nước dùng.',
      'Ăn kèm rau sống, chanh và ớt.',
    ],
  },
  {
    id: 11,
    name: 'Canh Khoai Mỡ',
    category: 'Vietnamese',
    image: img11,
    time: '20 phút',
    calories: '210 kcal',
    badge: 'Home Style',
    description: 'Canh khoai mỡ tím dẻo, thơm béo, phù hợp bữa cơm gia đình.',
    servings: '3 người',
    ingredients: [
      '300g khoai mỡ',
      '100g tôm hoặc thịt băm',
      'Hành lá, ngò om',
      '1 lít nước',
      'Muối, tiêu, nước mắm',
    ],
    steps: [
      'Gọt vỏ khoai mỡ và bào hoặc cắt nhỏ.',
      'Xào tôm hoặc thịt băm cho thơm.',
      'Cho nước vào đun sôi, thêm khoai mỡ.',
      'Khuấy nhẹ để canh sánh lại.',
      'Nêm gia vị vừa ăn, thêm hành lá và ngò om trước khi tắt bếp.',
    ],
  },
  {
    id: 12,
    name: 'Canh Khổ Qua',
    category: 'Vietnamese',
    image: img12,
    time: '25 phút',
    calories: '180 kcal',
    badge: 'Healthy',
    description: 'Canh khổ qua nhồi thịt thanh mát, vị đắng dịu và nước dùng ngọt.',
    servings: '3 người',
    ingredients: [
      '2 trái khổ qua',
      '150g thịt heo xay',
      '1 ít mộc nhĩ',
      'Hành lá',
      '1 lít nước',
      'Muối, tiêu, nước mắm',
    ],
    steps: [
      'Bổ khổ qua, bỏ ruột, rửa sạch.',
      'Trộn thịt xay với mộc nhĩ, hành lá, muối và tiêu.',
      'Nhồi hỗn hợp thịt vào khổ qua rồi cắt khúc.',
      'Đun nước sôi, thả khổ qua vào nấu đến chín mềm.',
      'Nêm lại gia vị và dùng nóng.',
    ],
  },
  {
    id: 13,
    name: 'Cơm Cà Ri Và Thịt Heo Chiên Xù',
    category: 'Asian',
    image: img13,
    time: '35 phút',
    calories: '620 kcal',
    badge: 'Comfort Food',
    description: 'Cơm cà ri kiểu Nhật với thịt heo chiên xù giòn rụm, đậm đà.',
    servings: '2 người',
    ingredients: [
      '2 chén cơm trắng',
      '2 miếng thịt heo',
      'Bột chiên xù',
      '1 gói sốt cà ri hoặc viên cà ri Nhật',
      'Khoai tây, cà rốt, hành tây',
      'Bột mì, trứng',
    ],
    steps: [
      'Nấu sốt cà ri với hành tây, cà rốt, khoai tây và viên cà ri.',
      'Tẩm thịt heo qua bột mì, trứng và bột chiên xù.',
      'Chiên thịt đến khi vàng giòn rồi cắt lát.',
      'Múc cơm ra đĩa, chan sốt cà ri bên cạnh.',
      'Xếp thịt heo chiên xù lên trên và dùng nóng.',
    ],
  },
  {
    id: 14,
    name: 'Há Cảo',
    category: 'Chinese',
    image: img14,
    time: '30 phút',
    calories: '300 kcal',
    badge: 'Dim Sum',
    description: 'Há cảo mềm, nhân tôm thịt ngọt thanh, thích hợp món ăn nhẹ.',
    servings: '2 người',
    ingredients: [
      '20 vỏ há cảo',
      '150g tôm băm',
      '100g thịt xay',
      '1 ít hành lá',
      'Gia vị: tiêu, dầu mè, nước tương',
    ],
    steps: [
      'Trộn tôm, thịt, hành lá và gia vị thành nhân.',
      'Cho nhân vào giữa vỏ há cảo.',
      'Gấp mép vỏ lại thành hình há cảo.',
      'Xếp vào xửng hấp.',
      'Hấp 10–12 phút đến khi chín, dùng với xì dầu.',
    ],
  },
  {
    id: 15,
    name: 'Mì Hoành Thánh Xá Xíu',
    category: 'Chinese',
    image: img15,
    time: '35 phút',
    calories: '470 kcal',
    badge: 'Chinese',
    description: 'Mì hoành thánh xá xíu với nước dùng ngọt, sợi mì dai và thịt thơm.',
    servings: '2 người',
    ingredients: [
      '2 vắt mì trứng',
      '10 viên hoành thánh',
      '150g thịt xá xíu',
      '1 lít nước dùng gà hoặc xương',
      'Cải thìa',
      'Hành lá',
    ],
    steps: [
      'Luộc mì trứng và cải thìa riêng.',
      'Đun sôi nước dùng, nêm vừa ăn.',
      'Luộc hoành thánh cho chín.',
      'Cho mì vào tô, xếp hoành thánh và xá xíu lên trên.',
      'Chan nước dùng nóng, thêm cải thìa và hành lá.',
    ],
  },
  {
    id: 16,
    name: 'Mì Lạnh Hàn Quốc',
    category: 'Korean',
    image: img16,
    time: '20 phút',
    calories: '330 kcal',
    badge: 'Korean',
    description: 'Mì lạnh thanh mát, thích hợp ngày nóng với nước dùng lạnh chua ngọt.',
    servings: '2 người',
    ingredients: [
      '2 phần mì lạnh',
      '1 quả trứng luộc',
      'Dưa leo',
      'Lê hoặc táo cắt lát',
      'Nước dùng lạnh hoặc nước sốt mì lạnh',
      'Giấm, mù tạt',
    ],
    steps: [
      'Luộc mì rồi xả nước lạnh cho săn sợi.',
      'Cho mì vào tô.',
      'Thêm dưa leo, lê hoặc táo và trứng luộc.',
      'Chan nước dùng lạnh vào tô.',
      'Thêm giấm hoặc mù tạt tùy khẩu vị rồi dùng ngay.',
    ],
  },
  {
    id: 17,
    name: 'Mì Quảng',
    category: 'Vietnamese',
    image: img17,
    time: '35 phút',
    calories: '490 kcal',
    badge: 'Vietnamese',
    description: 'Mì Quảng đậm đà với ít nước dùng, đậu phộng và bánh tráng nướng.',
    servings: '2 người',
    ingredients: [
      '200g mì Quảng',
      '200g gà hoặc tôm thịt',
      '1 ít đậu phộng rang',
      'Bánh tráng nướng',
      'Rau sống',
      'Nghệ, hành, tỏi',
    ],
    steps: [
      'Xào gà hoặc tôm thịt với nghệ, hành và tỏi.',
      'Thêm ít nước để tạo phần nước dùng sệt vừa đủ.',
      'Trụng mì Quảng và cho ra tô.',
      'Múc nhân và nước dùng lên mì.',
      'Rắc đậu phộng, ăn kèm rau sống và bánh tráng nướng.',
    ],
  },
  {
    id: 18,
    name: 'Mì Ý Sốt Dầu Tỏi',
    category: 'Italian',
    image: img18,
    time: '15 phút',
    calories: '390 kcal',
    badge: 'Quick',
    description: 'Mì Ý sốt dầu tỏi đơn giản nhưng thơm đậm vị, phù hợp bữa nhanh.',
    servings: '2 người',
    ingredients: [
      '200g spaghetti',
      '4 tép tỏi',
      '3 muỗng canh dầu olive',
      'Ớt khô',
      'Muối, tiêu',
      'Phô mai bào tùy thích',
    ],
    steps: [
      'Luộc mì đến chín vừa.',
      'Phi tỏi với dầu olive cho vàng thơm, thêm ớt khô.',
      'Cho mì vào chảo đảo đều.',
      'Nêm muối tiêu vừa ăn.',
      'Bày ra đĩa, thêm phô mai nếu thích.',
    ],
  },
  {
    id: 19,
    name: 'Mì Ý Sốt Kem',
    category: 'Italian',
    image: img19,
    time: '20 phút',
    calories: '480 kcal',
    badge: 'Creamy',
    description: 'Mì Ý sốt kem béo mịn, thơm mùi sữa và phô mai.',
    servings: '2 người',
    ingredients: [
      '200g mì Ý',
      '150ml whipping cream',
      '2 tép tỏi',
      '30g phô mai parmesan',
      '1 muỗng canh bơ',
      'Muối, tiêu',
    ],
    steps: [
      'Luộc mì chín rồi để ráo.',
      'Phi tỏi với bơ cho thơm.',
      'Cho whipping cream vào, đun nhỏ lửa.',
      'Thêm phô mai, muối và tiêu vào khuấy đều.',
      'Cho mì vào đảo cùng sốt rồi dùng nóng.',
    ],
  },
  {
    id: 20,
    name: 'Salad Hoa Quả',
    category: 'Healthy',
    image: img20,
    time: '10 phút',
    calories: '220 kcal',
    badge: 'Fresh',
    description: 'Salad trái cây nhiều màu sắc, tươi mát và dễ làm.',
    servings: '2 người',
    ingredients: [
      'Táo',
      'Dâu',
      'Kiwi',
      'Nho',
      'Cam hoặc xoài',
      '1 hộp yogurt không đường',
      'Mật ong',
    ],
    steps: [
      'Rửa sạch và cắt nhỏ tất cả các loại trái cây.',
      'Cho trái cây vào tô lớn.',
      'Trộn yogurt với một ít mật ong.',
      'Rưới hỗn hợp sốt lên trái cây.',
      'Trộn nhẹ tay và dùng lạnh.',
    ],
  },
  {
    id: 21,
    name: 'Salad Khoai Tây',
    category: 'Healthy',
    image: img21,
    time: '20 phút',
    calories: '310 kcal',
    badge: 'Healthy',
    description: 'Salad khoai tây bùi béo, dễ ăn và phù hợp món phụ hoặc bữa nhẹ.',
    servings: '2 người',
    ingredients: [
      '2 củ khoai tây',
      '1 quả trứng luộc',
      '1/2 củ hành tây',
      '2 muỗng canh mayonnaise',
      '1 muỗng cà phê mù tạt',
      'Muối, tiêu',
    ],
    steps: [
      'Luộc khoai tây chín mềm rồi cắt hạt lựu.',
      'Cắt nhỏ trứng luộc và hành tây.',
      'Trộn mayonnaise với mù tạt, muối và tiêu.',
      'Cho khoai tây, trứng và hành tây vào tô rồi trộn với sốt.',
      'Làm lạnh trước khi dùng để món ngon hơn.',
    ],
  },
];

const suggestedDishes = recipes.slice(0, 4);

export function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { mode } = useMode();

  const filteredDishes =
    activeTab === 'asian'
      ? recipes.filter((dish) =>
        ['Asian', 'Japanese', 'Vietnamese', 'Chinese', 'Korean'].includes(dish.category)
      )
      : recipes;

  const goToMealDetail = (recipe: Recipe) => {
    navigate('/meal-detail', { state: { recipe } });
  };

  if (mode === 'web') {
    return (
      <div className="pb-8 bg-white">
        <div className="px-12 pt-8 pb-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white fill-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Xin chào, bạn!</p>
                  <h2 className="text-3xl font-bold">
                    Bạn muốn ăn gì <span className="text-green-500">hôm nay?</span>
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-green-500 text-white text-lg">M</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Gợi ý cho bạn</h3>
              <button className="text-green-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Xem thêm
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {suggestedDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => goToMealDetail(dish)}
                  className="rounded-3xl overflow-hidden relative cursor-pointer group"
                >
                  <div className="h-80 relative">
                    <ImageWithFallback
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-sm font-semibold text-gray-800">{dish.badge}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h4 className="font-bold text-2xl mb-3">{dish.name}</h4>
                      <div className="flex items-center gap-6 text-base">
                        <span className="flex items-center gap-2">⏱️ {dish.time}</span>
                        <span className="flex items-center gap-2">🔥 {dish.calories}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Khám phá món ăn</h3>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${activeTab === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('asian')}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${activeTab === 'asian'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Châu Á
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => goToMealDetail(dish)}
                  className="cursor-pointer group"
                >
                  <div className="bg-gray-100 rounded-3xl overflow-hidden mb-3 aspect-square">
                    <ImageWithFallback
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-2">
                    <p className="text-sm text-gray-500 mb-1">{dish.category}</p>
                    <p className="font-semibold text-base">{dish.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 bg-white">
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-gray-600" />
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-green-500 text-white">M</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-gray-500 text-sm">Xin chào, Minh!</p>
          <h2 className="text-2xl font-bold">
            Bạn muốn ăn gì <span className="text-green-500">hôm nay?</span>
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-bold">Gợi ý cho bạn</h3>
          <button className="text-green-500 text-sm flex items-center gap-1">
            Xem thêm
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-2">
          {suggestedDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => goToMealDetail(dish)}
              className="flex-shrink-0 w-72 rounded-2xl overflow-hidden relative cursor-pointer"
            >
              <div className="h-56 relative">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-gray-800">{dish.badge}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-bold text-lg mb-2">{dish.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">⏱️ {dish.time}</span>
                    <span className="flex items-center gap-1">🔥 {dish.calories}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Khám phá món ăn</h3>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('asian')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'asian'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Châu Á
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => goToMealDetail(dish)}
              className="cursor-pointer"
            >
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-2 aspect-square">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1">
                <p className="text-xs text-gray-500 mb-1">{dish.category}</p>
                <p className="font-semibold text-sm">{dish.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}