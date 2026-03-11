import { PrismaClient, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function upsertEnvValue(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  const suffix = content.endsWith('\n') || content.length === 0 ? '' : '\n';
  return `${content}${suffix}${line}\n`;
}

async function main(): Promise<void> {
  const demoEmail = 'demo@estateai.dev';

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { name: 'Demo Buyer' },
    create: {
      name: 'Demo Buyer',
      email: demoEmail,
      phone: '555-0100',
    },
  });

  const existingProperty = await prisma.property.findFirst({
    where: {
      addressLine1: '123 Palm Ave',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
    },
  });

  const property = existingProperty
    ? await prisma.property.update({
        where: { id: existingProperty.id },
        data: { listingPrice: 550000 },
      })
    : await prisma.property.create({
        data: {
          addressLine1: '123 Palm Ave',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          listingPrice: 550000,
        },
      });

  let transaction = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      propertyId: property.id,
      transactionType: TransactionType.buy,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!transaction) {
    transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        transactionType: TransactionType.buy,
      },
    });
  }

  const repoRoot = process.cwd();
  const frontendEnvPath = path.join(repoRoot, 'frontend', '.env.local');

  const existingEnv = fs.existsSync(frontendEnvPath)
    ? fs.readFileSync(frontendEnvPath, 'utf8')
    : '';

  let nextEnv = existingEnv;
  nextEnv = upsertEnvValue(nextEnv, 'NEXT_PUBLIC_API_URL', 'http://localhost:8080/api/v1');
  nextEnv = upsertEnvValue(nextEnv, 'NEXT_PUBLIC_DEFAULT_USER_ID', user.id);
  nextEnv = upsertEnvValue(nextEnv, 'NEXT_PUBLIC_DEFAULT_TRANSACTION_ID', transaction.id);

  fs.writeFileSync(frontendEnvPath, nextEnv, 'utf8');

  // eslint-disable-next-line no-console
  console.log('Demo seed complete');
  // eslint-disable-next-line no-console
  console.log(`User ID: ${user.id}`);
  // eslint-disable-next-line no-console
  console.log(`Transaction ID: ${transaction.id}`);
  // eslint-disable-next-line no-console
  console.log(`Updated: ${frontendEnvPath}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
