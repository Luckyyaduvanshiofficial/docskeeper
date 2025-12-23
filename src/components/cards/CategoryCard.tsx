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
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card overflow-hidden",
        className
      )}>
        <CardContent className="p-6">
          <div className={cn(
            "w-12 h-12 flex items-center justify-center mb-4 bg-gradient-to-br",
            config.gradient
          )}>
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {category}
          </h3>
          <p className="text-2xl font-bold text-foreground">
            {count}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              documents
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
