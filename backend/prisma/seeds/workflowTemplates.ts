import { PrismaClient, TransactionType, WorkflowStage } from '@prisma/client';

type TemplateTaskInput = {
  stageName: WorkflowStage;
  taskName: string;
  taskOrder: number;
};

const prisma = new PrismaClient();

const buyerTasks: TemplateTaskInput[] = [
  { stageName: WorkflowStage.select_property, taskName: 'Confirm target property', taskOrder: 1 },
  { stageName: WorkflowStage.select_property, taskName: 'Verify listing details', taskOrder: 2 },

  { stageName: WorkflowStage.submit_offer, taskName: 'Submit purchase offer', taskOrder: 1 },
  { stageName: WorkflowStage.submit_offer, taskName: 'Upload purchase agreement', taskOrder: 2 },

  { stageName: WorkflowStage.offer_accepted, taskName: 'Confirm offer acceptance terms', taskOrder: 1 },

  { stageName: WorkflowStage.inspection_period, taskName: 'Schedule inspection', taskOrder: 1 },
  { stageName: WorkflowStage.inspection_period, taskName: 'Upload inspection report', taskOrder: 2 },

  { stageName: WorkflowStage.mortgage_process, taskName: 'Submit mortgage application', taskOrder: 1 },
  { stageName: WorkflowStage.mortgage_process, taskName: 'Provide financial documents', taskOrder: 2 },

  { stageName: WorkflowStage.appraisal, taskName: 'Order appraisal', taskOrder: 1 },
  { stageName: WorkflowStage.appraisal, taskName: 'Review appraisal report', taskOrder: 2 },

  { stageName: WorkflowStage.closing_preparation, taskName: 'Review closing disclosure', taskOrder: 1 },
  { stageName: WorkflowStage.closing_preparation, taskName: 'Schedule closing', taskOrder: 2 },

  { stageName: WorkflowStage.closing, taskName: 'Sign closing documents', taskOrder: 1 },
  { stageName: WorkflowStage.closing, taskName: 'Transfer funds', taskOrder: 2 },
];

const sellerTasks: TemplateTaskInput[] = [
  { stageName: WorkflowStage.prepare_home_for_sale, taskName: 'Prepare home for listing', taskOrder: 1 },
  { stageName: WorkflowStage.prepare_home_for_sale, taskName: 'Collect property documents', taskOrder: 2 },

  { stageName: WorkflowStage.list_property, taskName: 'Create listing', taskOrder: 1 },
  { stageName: WorkflowStage.list_property, taskName: 'Upload listing photos', taskOrder: 2 },

  { stageName: WorkflowStage.receive_offers, taskName: 'Review offers', taskOrder: 1 },
  { stageName: WorkflowStage.receive_offers, taskName: 'Select best offer', taskOrder: 2 },

  { stageName: WorkflowStage.accept_offer, taskName: 'Sign acceptance documents', taskOrder: 1 },

  { stageName: WorkflowStage.inspection_period, taskName: 'Coordinate buyer inspection access', taskOrder: 1 },

  { stageName: WorkflowStage.title_and_escrow, taskName: 'Open escrow', taskOrder: 1 },
  { stageName: WorkflowStage.title_and_escrow, taskName: 'Verify title report', taskOrder: 2 },

  { stageName: WorkflowStage.closing_preparation, taskName: 'Review settlement statement', taskOrder: 1 },
  { stageName: WorkflowStage.closing_preparation, taskName: 'Confirm closing date', taskOrder: 2 },

  { stageName: WorkflowStage.closing, taskName: 'Sign closing paperwork', taskOrder: 1 },
  { stageName: WorkflowStage.closing, taskName: 'Transfer ownership', taskOrder: 2 },
];

async function upsertTemplate(
  name: string,
  transactionType: TransactionType,
  tasks: TemplateTaskInput[],
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workflowTemplate.findFirst({
      where: { name, transactionType },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    const template =
      existing ??
      (await tx.workflowTemplate.create({
        data: { name, transactionType },
        select: { id: true },
      }));

    await tx.workflowTemplateTask.deleteMany({
      where: { templateId: template.id },
    });

    await tx.workflowTemplateTask.createMany({
      data: tasks.map((task) => ({
        templateId: template.id,
        stageName: task.stageName,
        taskName: task.taskName,
        taskOrder: task.taskOrder,
      })),
    });

    return tasks.length;
  });
}

async function main(): Promise<void> {
  const buyerInserted = await upsertTemplate(
    'Buyer Workflow',
    TransactionType.buy,
    buyerTasks,
  );

  const sellerInserted = await upsertTemplate(
    'Seller Workflow',
    TransactionType.sell,
    sellerTasks,
  );

  const totalInserted = buyerInserted + sellerInserted;

  console.log(`Seed complete. Buyer tasks: ${buyerInserted}`);
  console.log(`Seed complete. Seller tasks: ${sellerInserted}`);
  console.log(`Total tasks inserted: ${totalInserted}`);
}

main()
  .catch((error) => {
    console.error('Workflow template seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
