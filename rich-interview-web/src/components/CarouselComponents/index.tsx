import { Carousel } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styles from "@/app/page.module.css";

interface CarouselItem {
    href: string;
    imgSrc: string;
    alt: string;
    title: string;
    description: string;
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
                        <div className={styles.slideContent}>
                            <Image
                                src={item.imgSrc}
                                alt={item.alt}
                                fill
                                priority
                                sizes="100vw"
                                className={styles.carouselImage}
                            />
                            <div className={styles.slideText}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </Carousel>
        </div>
    );
};

export default CarouselComponent;