import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Receipt, 
  CreditCard, 
  Award, 
  FileText,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: string;
  count: number;
  className?: string;
}

const categoryConfig: Record<string, { icon: LucideIcon; gradient: string }> = {
  Academic: { icon: GraduationCap, gradient: 'from-primary/20 to-primary/5' },
  Receipts: { icon: Receipt, gradient: 'from-secondary/20 to-secondary/5' },
  'ID Proofs': { icon: CreditCard, gradient: 'from-muted/30 to-muted/10' },
  Certificates: { icon: Award, gradient: 'from-primary/15 to-primary/5' },
  Others: { icon: FileText, gradient: 'from-secondary/15 to-secondary/5' },
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, className }) => {
  const config = categoryConfig[category] || categoryConfig.Others;
  const Icon = config.icon;

  return (
    <Link to={`/search?category=${encodeURIComponent(category)}`}>
      <Card className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card overflow-hidden h-full",
        className
      )}>
        <CardContent className="p-4 sm:p-6">
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-br rounded-lg",
            config.gradient
          )}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-sm sm:text-base truncate">
            {category}
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {count}
            <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1 sm:ml-2">
              docs
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
