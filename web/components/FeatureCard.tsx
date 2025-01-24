import React from "react";
import Link from "next/link";
interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = (
  { title, description, image, link },
) => {
  return (
    <Link href={link}>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300">
        <img
          src={image}
          alt={`${title} Icon`}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
