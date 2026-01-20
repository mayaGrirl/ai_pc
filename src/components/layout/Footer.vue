<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isHomePage = () => route.path === '/'
</script>

<template>
  <div class="footer_box footerbox">
    <div class="footer_centers" v-if="isHomePage()">
      <div class="ewm_box">
        <div class="img">
          <img src="/ewm_app.svg" width="117" height="117">
        </div>
        <p>
          <span></span>
          <span></span>
          <span></span>
          <span>随时玩游戏</span>
          <span>轻松抽奖品</span>
        </p>
      </div>
      <div class="qq_box">
        <h1>QQ:228711</h1>
        <p>有问题请咨询在线客服</p>
        <p>周一至周五；9：30-12：00 14：00-18：00</p>
      </div>
      <div class="channel_box">
        <dl class="bzzx">
          <dt>帮助中心</dt>
          <dd><a href="#" target="_blank">鼎丰28是什么？</a></dd>
          <dd><a href="#" target="_blank">如何注册帐号？</a></dd>
          <dd><a href="#" target="_blank">生态值的用途？</a></dd>
          <dd><a href="#" target="_blank">游戏积分的用途？</a></dd>
        </dl>
        <dl class="yqlj">
          <dt>友情链接</dt>
          <dd><a href="https://wan.liebao.cn/" target="_blank">金山猎豹</a></dd>
          <dd><a href="http://www.game2.cn/" target="_blank">好游戏找哥们</a></dd>
          <dd><a href="http://game.163.com/" target="_blank">网易游戏</a></dd>
          <dd><a href="http://www.aotian.com/" target="_blank">傲天游戏</a></dd>
          <dd><a href="http://www.tarenwang.com/" target="_blank">塔人网络</a></dd>
          <dd><a href="https://www.51.com/" target="_blank">51游戏</a></dd>
          <dd><a href="http://www.4366.com/" target="_blank">4366网页游戏</a></dd>
          <dd><a href="http://www.dankaxiu.com" target="_blank">兼职资讯</a></dd>
        </dl>
      </div>
    </div>
    <div class="footer_ends">
      <div class="nei">
        <div class="left">
          <p></p>
          <ul>
            <li><a href="#">关于鼎丰</a></li>
            <li>|</li>
            <li><a href="#">服务条款</a></li>
            <li>|</li>
            <li><a href="#">广告服务</a></li>
            <li>|</li>
            <li><a href="#">合作商家</a></li>
            <li>|</li>
            <li><a href="#">鼎丰生活</a></li>
          </ul>
          <p></p>
          <p class="copyright-text">版权所有：鼎丰网络 ICP证：浙B2-20090227 <img src="/police.png"> 浙公网安备 33010602004295号</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Footer Box */
.footer_box {
  border-top: 1px solid #e8e9eb;
  width: 100%;
  height: auto;
  overflow: hidden;
  background: #fafafa;
}

.footer_box .footer_centers {
  width: 1200px;
  height: 194px;
  overflow: hidden;
  margin: 0 auto;
}

/* QR Code Section */
.footer_box .footer_centers .ewm_box {
  float: left;
}

.footer_box .footer_centers .ewm_box .img {
  float: left;
  margin: 36px 14px auto auto;
}

.footer_box .footer_centers .ewm_box .img img {
  width: 117px;
  height: 117px;
}

.footer_box .footer_centers .ewm_box p {
  margin-top: 36px;
  width: 135px;
  float: left;
  padding-right: 34px;
  border-right: 1px solid #dadada;
}

.footer_box .footer_centers .ewm_box p span {
  font-size: 13px;
  color: #666666;
  line-height: 23px;
  display: inline-block;
  height: 23px;
  width: 135px;
}

/* QQ Contact */
.footer_box .footer_centers .qq_box {
  width: 350px;
  height: auto;
  overflow: hidden;
  margin-top: 36px;
  padding-left: 46px;
  float: left;
  color: #666;
}

.footer_box .footer_centers .qq_box h1 {
  margin: 0 auto;
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: inherit;
}

.footer_box .footer_centers .qq_box p {
  font-size: 13px;
  line-height: 25px;
}

/* Channel Box - Links */
.footer_box .footer_centers .channel_box {
  float: right;
  margin-top: 28px;
}

.footer_box .footer_centers .channel_box dl {
  float: left;
  color: #666;
  margin: 0 auto;
}

.footer_box .footer_centers .channel_box dl.bzzx {
  width: 105px;
}

.footer_box .footer_centers .channel_box dl.yqlj {
  width: 315px;
}

.footer_box .footer_centers .channel_box dl dt {
  font-size: 15px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 5px;
}

.footer_box .footer_centers .channel_box dl dd {
  display: inline-block;
  float: left;
  text-align: left;
  width: 105px;
  margin: 0 auto;
  height: 29px;
  line-height: 29px;
}

.footer_box .footer_centers .channel_box dl dd a {
  color: #989898;
}

.footer_box .footer_centers .channel_box dl dd a:hover {
  text-decoration: underline;
  color: #666;
}

/* Footer Bottom */
.footer_box .footer_ends {
  background: #323441;
}

.footer_box .footer_ends .nei {
  width: 1200px;
  height: auto;
  overflow: hidden;
  padding: 18px 0 22px 0;
  text-align: center;
  margin: 0 auto;
}

.footer_box .footer_ends .nei .left {
  color: #a3a4aa;
  line-height: 28px;
  text-align: center;
}


.footer_box .footer_ends .nei .left ul {
  text-align: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer_box .footer_ends .nei .left ul li {
  color: #a3a4aa;
  display: inline-block;
  margin: 0 10px;
  line-height: 40px;
}

.footer_box .footer_ends .nei .left ul li a {
  color: #a3a4aa;
  text-decoration: none;
}

.footer_box .footer_ends .nei .left ul li a:hover {
  color: #fff;
}

.footer_box .footer_ends .nei .left p {
  margin: 0;
  font-size: 12px;
}

.footer_box .footer_ends .nei .left p a {
  color: #a3a4aa;
  text-decoration: none;
}

.footer_box .footer_ends .nei .left p a:hover {
  color: #fff;
}

.footer_box .footer_ends .nei .left p.copyright-text {
  display: block;
  line-height: 28px;
}

.footer_box .footer_ends .nei .left p.copyright-text img {
  display: inline-block;
  vertical-align: middle;
  margin: 0 5px;
  width: 18px;
  height: 18px;
}
</style>
