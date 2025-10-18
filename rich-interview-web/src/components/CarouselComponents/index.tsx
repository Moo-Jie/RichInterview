import {Carousel} from "antd";
import Link from "next/link";
import React from "react";
import styles from "@/app/page.module.css";

interface CarouselItem {
  href: string;
  // imgSrc: string;
  alt: string;
  title: string;
  description: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

/**
 * 轮播图组件
 * @param items
 * @constructor
 */
const CarouselComponent: React.FC<{ items: CarouselItem[] }> = ({ items }) => {
  return (
    <div className={styles.carouselContainer}>
      <Carousel
        autoplay={{ dotDuration: true }}
        effect="fade"
        dots={{ className: styles.dots }}
        arrows={true}
        draggable={true}
        infinite
        autoplaySpeed={3500}
        speed={600}
        easing="linear"
        adaptiveHeight
      >
        {items.map((item, index) => (
          <Link key={index} href={item.href} className={styles.carouselItem}>
            <div
              className={styles.slideContent}
              style={{ backgroundColor: item.backgroundColor }}
            >
              {/* 动态遮罩层 */}
              <div className={styles.colorOverlay}></div>

              <div className={styles.slideText}>
                <div className={styles.iconWrapper}>{item.icon}</div>
                <h3 data-content={item.title}>{item.title}</h3>
                <p data-content={item.description}>{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
