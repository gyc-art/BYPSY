
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 伴言心理 - 支付安全校验接口
 * 对接网商银行/支付宝订单查询接口
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId, phone } = req.body;

  // 1. 安全校验：从环境变量读取商户密钥，严禁代码明文存储
  const MERCHANT_ID = process.env.MYBANK_MERCHANT_ID;
  const API_KEY = process.env.MYBANK_API_KEY;

  if (!MERCHANT_ID || !API_KEY) {
    console.error('Missing Payment Provider Credentials in Environment');
    // 如果没有配置 Key，返回一个模拟成功（用于演示）或报错
    // 实际生产环境应在此发起 HTTPS 请求至银行/支付宝网关
  }

  try {
    /** 
     * 模拟支付查询逻辑
     * 在真实场景中，此处应调用支付宝或网商银行的查询接口:
     * const response = await fetch('https://api.mybank.cn/query', { ...sign(payload) });
     */
    
    // 模拟演示：如果是特定测试编号或随机模拟
    const isSuccess = Math.random() > 0.7; // 模拟 30% 概率检查到成功

    return res.status(200).json({
      success: isSuccess,
      orderId,
      status: isSuccess ? 'TRADE_SUCCESS' : 'WAIT_BUYER_PAY',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Payment Verification Error' });
  }
}
