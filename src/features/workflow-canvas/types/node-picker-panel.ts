export type NavigationItem =
  | {
      type: "root";
      data: WorkflowCategoryList;
    }
  | {
      type: "category" | "subcategory";
      data: WorkflowCategory;
    };

export interface TemplateMeta {
  icon?: string;
  color: string;
  border: string;
  request?: Object;
  response?: Object;
}

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  categoryId: string;
  metadata: TemplateMeta | null;
  visibility: boolean;
}

// Category + SubCategory structure
export interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  parentId: string | null;
  icon: string | null;
  visibility: boolean;
  subCategories: WorkflowCategory[];
  nodeTemplates: NodeTemplate[];
}

export type WorkflowCategoryList = WorkflowCategory[];
