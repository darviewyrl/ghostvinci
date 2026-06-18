import React from 'react';
import jokerImage from '../../../img/joker.png';

const playSteps = [
  'เริ่มพิธีกรรมหรือเริ่มเกมจากแผงด้านขวา',
  'ระบบเตรียมสำรับไพ่ตัวเลขและไพ่พิเศษ',
  'หากตั้งค่า “คัดไพ่ออก” ไว้ ไพ่บางใบจะถูกนำออกก่อนเริ่มเล่น',
  'ผู้เล่นและ AI ได้รับไพ่ที่ซ่อนอยู่คนละชุด',
  'ใช้ตรรกะ ไพ่ที่เปิดเผย และเบาะแสบนโต๊ะเพื่อเดาไพ่ของฝ่ายตรงข้าม',
  'ถ้าเดาถูก ไพ่หรือข้อมูลบางอย่างจะถูกเปิดเผยและช่วยจำกัดความเป็นไปได้',
  'ถ้าเดาผิด คุณจะเสียจังหวะหรือเจอความเสี่ยงที่ทำให้ฝ่ายตรงข้ามได้เปรียบ',
  'เล่นต่อจนกว่าจะเปิดไพ่ของอีกฝ่ายได้หมด หรือถูกอีกฝ่ายอ่านเกมจนพ่ายแพ้',
];

const tips = [
  'สังเกตไพ่ที่เหลืออยู่เสมอ เพราะไพ่ที่หายไปช่วยตัดความเป็นไปได้',
  'อย่าเดาสุ่มถ้าไม่มีเหตุผลรองรับ การเดาผิดทำให้เสียจังหวะ',
  'ใช้ไพ่ที่เปิดเผยแล้วเป็นหลักฐานในการไล่ช่วงตัวเลข',
  'คิดด้วยว่า AI เห็นข้อมูลอะไรอยู่ และมันอาจเดาอะไรจากมือของคุณ',
];

export default function LobbyGuideSection() {
  const scrollToTop = () => {
    const scrollContainer = document.getElementById('root');
    if (scrollContainer && typeof scrollContainer.scrollTo === 'function') {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="ghostvinci-guide"
      className="lobby-guide-section relative z-10 px-5 pb-16 pt-10 sm:px-8 lg:px-7 xl:px-10"
      aria-labelledby="ghostvinci-guide-title"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="lobby-guide-heading">
          <p>Ghostvinci Manual</p>
          <h2 id="ghostvinci-guide-title">คู่มือการเล่น</h2>
          <span />
        </div>

        <div className="lobby-guide-grid mt-8">
          <article className="lobby-guide-card lobby-guide-card--wide">
            <h3>ภาพรวม</h3>
            <p>
              GHOSTVINCI คือเกมเดาไพ่แนวสืบเหตุผลในบรรยากาศพิธีกรรมมืด ผู้เล่นต้องอ่านเบาะแสจากไพ่ที่เปิดเผย
              คิดถึงเลขที่ยังซ่อนอยู่ และเดาไพ่ของฝ่ายตรงข้ามให้แม่นกว่าที่เขาเดาเรา
            </p>
          </article>

          <article className="lobby-guide-card">
            <h3>เป้าหมาย</h3>
            <p>
              เป้าหมายคือเปิดเผยไพ่ซ่อนของฝ่ายตรงข้ามให้ได้ก่อน ไพ่แต่ละใบที่เดาถูกจะทำให้คุณเห็นภาพรวมชัดขึ้น
              และเข้าใกล้ชัยชนะมากขึ้น
            </p>
          </article>

          <article className="lobby-guide-card">
            <h3>กติกาสำคัญ</h3>
            <p>
              ใช้ข้อมูลที่มีอยู่ในการตัดสินใจ ไพ่ที่เปิดเผยแล้ว ไพ่ที่ถูกคัดออก และจังหวะการเดาของ AI
              ล้วนช่วยบอกได้ว่าเลขใดเป็นไปได้หรือไม่น่าใช่
            </p>
          </article>

          <article className="lobby-guide-card lobby-guide-card--cards">
            <div>
              <h3>ไพ่ในเกม</h3>
              <p>
                ไพ่ตัวเลขคือข้อมูลหลักของเกม คุณต้องค่อย ๆ จำกัดช่วงตัวเลขจากเบาะแสที่เห็น
                หากในเกมมีไพ่คนละสีหรือคนละประเภท ให้ใช้สีและประเภทนั้นช่วยแยกความเป็นไปได้ด้วย
              </p>
              <p>
                Joker คือไพ่พิเศษที่อ่านยากกว่าไพ่ตัวเลขทั่วไป เมื่อ Joker อยู่ในเกม คุณต้องระวังตำแหน่งและจังหวะ
                เพราะมันอาจทำให้การเดาตรง ๆ ไม่ง่ายเหมือนเดิม
              </p>
            </div>
            <figure className="lobby-guide-joker">
              <img src={jokerImage} alt="ไพ่ Joker" draggable="false" />
              <figcaption>Joker</figcaption>
            </figure>
          </article>

          <article className="lobby-guide-card lobby-guide-card--wide">
            <h3>วิธีเล่น</h3>
            <ol className="lobby-guide-steps">
              {playSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="lobby-guide-card">
            <h3>ระดับความดุร้าย</h3>
            <p>
              <strong>ง่าย</strong> เหมาะกับการเรียนรู้จังหวะเกม
              <br />
              <strong>ปานกลาง</strong> AI จะอ่านสถานการณ์มากขึ้น
              <br />
              <strong>อันตราย</strong> เหมาะกับคนที่อยากเจอแรงกดดันและการเดาที่คมกว่าเดิม
            </p>
          </article>

          <article className="lobby-guide-card">
            <h3>คัดไพ่ออก</h3>
            <p>
              คัดไพ่ออกคือการนำไพ่บางส่วนออกจากเกมก่อนเริ่มเล่น 0 ใบคือเล่นแบบข้อมูลครบที่สุด
              ส่วน 2, 4 และ 6 ใบจะทำให้ไพ่ในเกมลดลง ยิ่งคัดออกมาก ยิ่งต้องเดาจากข้อมูลที่น้อยลง
            </p>
          </article>

          <article className="lobby-guide-card lobby-guide-card--wide">
            <h3>เคล็ดลับเริ่มต้น</h3>
            <ul className="lobby-guide-tips">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 flex justify-center">
          <button type="button" className="lobby-guide-top-button" onClick={scrollToTop}>
            กลับไปเริ่มพิธีกรรม
          </button>
        </div>
      </div>
    </section>
  );
}
