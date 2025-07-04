import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PhotoGallery } from '@/components/ui/photo-gallery';
import { SortButton } from '@/components/ui/sort-button';
import { CategoryButton } from '@/components/ui/category-button';
import { usePhoto } from '@/hooks/usePhoto';
import type { SortOption } from '@/components/ui/sort-button';
import type { CategoryType } from '@/components/ui/category-button';

const HomePage = () => {
    const { totalCount, isSignedIn } = usePhoto();
    const [sortOption, setSortOption] = useState<SortOption>({ 
        field: 'date', 
        order: 'desc' 
    });
    const [categoryType, setCategoryType] = useState<CategoryType>('date');

    const subtitle = isSignedIn 
        ? `${totalCount} photo${totalCount !== 1 ? 's' : ''}`
        : undefined;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <PageHeader 
                    title="Photos" 
                    subtitle={subtitle}
                >
                    <CategoryButton 
                        currentCategory={categoryType}
                        onCategoryChange={setCategoryType}
                    />
                    <SortButton 
                        currentSort={sortOption}
                        onSortChange={setSortOption}
                    />
                </PageHeader>
                <PhotoGallery 
                    sortOption={sortOption} 
                    categoryType={categoryType}
                />
            </div>
        </div>
    );
}
 
export default HomePage;