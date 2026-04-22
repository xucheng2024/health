import { SectionTitle, postWarrantyRateBlock } from "./quotation-doc-primitives";

export function QuotationStandardClauses() {
  return (
    <>
      <SectionTitle>PAYMENT TERMS / 付款条款</SectionTitle>
      <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[15px] leading-relaxed marker:text-[#003F73]">
        <li>Full payment before system deployment — 系统上线前需全额付款</li>
        <li>
          Payment via bank transfer / PayNow — 支持银行转账 / PayNow
        </li>
      </ul>
      <div className="mt-4 rounded-xl border border-slate-200/85 bg-slate-50/40 p-4 text-[15px] leading-relaxed sm:p-5 print:border-slate-300 print:bg-neutral-50">
        <p className="text-sm font-semibold text-[#003F73]">
          Bank account details / 银行账号明细
        </p>
        <div className="mt-3 space-y-1.5 text-[#303030]">
          <p>
            <span className="text-[#303030]/65">Bank:</span> OCBC Bank
          </p>
          <p>
            <span className="text-[#303030]/65">Account number:</span>{" "}
            595663725001
          </p>
          <p>
            <span className="text-[#303030]/65">UEN:</span> 202333694H
          </p>
        </div>
      </div>

      <SectionTitle>TERMS AND CONDITIONS</SectionTitle>
      <ol className="quotation-doc__terms mt-6 list-decimal space-y-7 pl-4 text-[15px] leading-relaxed marker:font-semibold marker:text-[#003F73] sm:space-y-8 sm:pl-6 print:space-y-5 print:text-[12.5px] print:leading-snug">
        <li>
          <p className="font-semibold text-[#003F73]">
            Installation and Acceptance / 安装与验收
          </p>
          <p className="mt-2">
            HealthOptix shall configure and deploy the system. Upon completion,
            the Client shall confirm acceptance.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix 负责系统配置与部署，完成后客户确认验收。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Scope of System / 系统范围
          </p>
          <p className="mt-2">
            The system provided includes only the modules and services specified
            in this quotation. Any additional features, integrations, or
            customization will be separately scoped and quoted.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本系统仅包含报价单所列内容，额外功能或定制将另行报价。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            System Nature / 系统性质
          </p>
          <p className="mt-2">
            The HealthOptix System is an operations and data management
            platform for health and wellness businesses. It does not provide
            medical advice, diagnosis, or treatment decisions.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本系统为运营与数据管理工具，不涉及医疗诊断或治疗决策。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Subscription Period / 订阅周期
          </p>
          <p className="mt-2">
            For cloud-based services, the system is provided on a subscription
            basis unless otherwise stated. The Client is responsible for timely
            renewal to maintain system access.
          </p>
          <p className="mt-2 text-[#303030]/90">
            云系统为订阅制，客户需按时续费以保持使用权限。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Payment Terms / 付款条款
          </p>
          <p className="mt-2">
            Full payment must be made prior to system deployment unless
            otherwise agreed. HealthOptix reserves the right to suspend services
            in the event of non-payment.
          </p>
          <p className="mt-2 text-[#303030]/90">
            系统上线前需付全款，逾期可能暂停服务。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Warranty / 保修与保障</p>
          <p className="mt-2">
            HealthOptix provides a{" "}
            <span className="font-semibold text-[#002244] print:text-black">
              12-month warranty
            </span>{" "}
            for its software from the date of deployment, covering defects under
            normal use. This warranty applies to software only. Hardware (if any)
            is subject to the respective manufacturer&apos;s warranty.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix 对软件系统提供自上线之日起{" "}
            <span className="font-semibold text-[#002244] print:text-black">
              12 个月保修
            </span>
            ，适用于正常使用情况下的系统问题。本保修仅适用于软件，硬件（如有）按供应商保修条款执行。
          </p>
          <p className="mt-2">
            The warranty excludes issues arising from misuse, unauthorized
            modifications, third-party systems, or infrastructure failures.
          </p>
          <p className="mt-2 text-[#303030]/90">
            以下情况不在保修范围内：非正常使用、未经授权的修改、第三方系统或基础设施问题。
          </p>
          <p className="mt-3 font-medium text-[#003F73]">
            Post-Warranty Support / 保修期后支持
          </p>
          <div className={`${postWarrantyRateBlock} mt-2`}>
            <p>Onsite support is available upon request and chargeable as follows:</p>
            <p>Weekdays (9am–6pm): SGD 100 per visit</p>
            <p>Weekdays (6pm–12am): SGD 150 per visit</p>
            <p>Weekends / Public Holidays: SGD 200 per visit</p>
          </div>
          <div className={`${postWarrantyRateBlock} mt-3`}>
            <p>保修期后现场支持按次收费：</p>
            <p>工作日（9:00–18:00）SGD 100 / 次</p>
            <p>工作日（18:00–24:00）SGD 150 / 次</p>
            <p>周末及公共假期 SGD 200 / 次</p>
          </div>
          <div className={`${postWarrantyRateBlock} mt-3`}>
            <p>Fees exclude repair, replacement, or third-party costs.</p>
            <p>以上费用不包含维修、更换或第三方成本。</p>
          </div>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Support and Maintenance / 技术支持与维护
          </p>
          <p className="mt-2">
            Standard support includes system troubleshooting, minor updates,
            and bug fixes.
          </p>
          <p className="mt-2 text-[#303030]/90">
            标准支持包括系统问题处理、小规模更新及缺陷修复。
          </p>
          <p className="mt-2">
            Additional services, including customization, major configuration
            changes, and onsite support, may be subject to additional charges.
          </p>
          <p className="mt-2 text-[#303030]/90">
            定制开发、重大配置调整及现场支持等服务可能另行收费。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Setup and Configuration / 数据与配置
          </p>
          <p className="mt-2">
            Initial data setup (if applicable) will be performed based on data
            provided by the Client. The Client is responsible for ensuring data
            accuracy.
          </p>
          <p className="mt-2 text-[#303030]/90">
            初始数据由客户提供，客户需确保数据准确性。
          </p>
          <p className="mt-2">
            Subsequent data updates or reconfiguration may be chargeable.
          </p>
          <p className="mt-2 text-[#303030]/90">后续数据处理可能收费。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Ownership and Responsibility / 数据归属与责任
          </p>
          <p className="mt-2">
            All patient and customer data remain the property of the Client. The
            Client is responsible for compliance with applicable laws.
          </p>
          <p className="mt-2 text-[#303030]/90">
            数据归客户所有，客户负责合法使用。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Data Protection (PDPA Compliance) / 数据保护
          </p>
          <p className="mt-2">
            HealthOptix complies with the Personal Data Protection Act (PDPA) of
            Singapore.
          </p>
          <p className="mt-2 text-[#303030]/90">HealthOptix 遵循 PDPA 法规。</p>
          <p className="mt-2">
            HealthOptix will not access or use data except for system support
            with the Client&apos;s prior consent.
          </p>
          <p className="mt-2 text-[#303030]/90">
            除经客户事先同意用于系统支持外，HealthOptix 不会访问或使用任何数据。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Data Backup / 数据备份</p>
          <p className="mt-2">
            HealthOptix performs regular system backups on a best-effort basis.
            However, the Client is responsible for maintaining their own backup
            if required.
          </p>
          <p className="mt-2 text-[#303030]/90">
            系统提供备份，但客户需自行保留必要备份。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            System Availability / 系统可用性
          </p>
          <p className="mt-2">
            HealthOptix shall use reasonable efforts to maintain system
            availability on a 24/7 basis, except for planned maintenance and
            events beyond its control. However, uninterrupted or error-free
            operation cannot be guaranteed.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix
            将在合理范围内尽力维持系统全天候（24/7）运行，但不包括计划内维护及其无法控制的情形，亦无法保证系统持续无中断或无错误运行。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Resource & Fair Usage / 资源与合理使用
          </p>
          <p className="mt-2">
            The subscription includes reasonable usage of system resources,
            including storage and bandwidth, under normal business operations.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本订阅费用已包含在正常业务使用范围内的系统资源（包括存储与带宽）。
          </p>
          <p className="mt-2">
            HealthOptix reserves the right to monitor system usage to ensure
            fair and appropriate use of the platform. In the event of excessive
            or abnormal usage (including but not limited to unusually high media
            uploads, downloads, or streaming activities), HealthOptix may:
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix 有权对系统使用情况进行监控，以确保平台的合理与公平使用。如出现异常或过度使用情况（包括但不限于大量视频或音频上传、下载或频繁播放等），HealthOptix 有权：
          </p>
          <p className="mt-2">
            (a) recommend an upgrade to a higher subscription plan;
          </p>
          <p className="mt-2 text-[#303030]/90">
            （a）建议客户升级至更高订阅方案；
          </p>
          <p className="mt-2">(b) impose reasonable usage limitations; or</p>
          <p className="mt-2 text-[#303030]/90">（b）实施合理的使用限制；或</p>
          <p className="mt-2">
            (c) take necessary measures to maintain system performance and
            stability.
          </p>
          <p className="mt-2 text-[#303030]/90">
            （c）采取必要措施以确保系统性能与稳定性。
          </p>
          <p className="mt-2">
            The platform is not intended for large-scale media hosting or
            distribution beyond normal operational use.
          </p>
          <p className="mt-2 text-[#303030]/90">
            本平台并非用于大规模媒体存储或分发用途。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Non-Transferability / 不可转让
          </p>
          <p className="mt-2">
            The system license is non-transferable without prior written
            consent.
          </p>
          <p className="mt-2 text-[#303030]/90">系统授权不可转让。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Non-Refundable / 不可退款</p>
          <p className="mt-2">
            All payments made are non-refundable once services have commenced.
          </p>
          <p className="mt-2 text-[#303030]/90">服务开始后费用不退款。</p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Missed Appointments / 延误与重约
          </p>
          <p className="mt-2">
            If system deployment or setup is delayed due to Client-side readiness
            issues (e.g. no internet, incomplete setup), additional charges may
            apply.
          </p>
          <p className="mt-2 text-[#303030]/90">
            如果由于客户端准备问题（例如没有互联网、设置不完整）导致系统部署或设置延迟，则可能需要支付额外费用。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Limitation of Liability / 责任限制
          </p>
          <p className="mt-2">
            HealthOptix shall not be liable for any indirect or consequential
            damages, including loss of revenue, loss of business, data loss, or
            system interruption.
          </p>
          <p className="mt-2 text-[#303030]/90">
            HealthOptix
            不对任何间接或后果性损失承担责任，包括但不限于收入损失、业务损失、数据丢失或系统中断。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">
            Responsibility &amp; Liability / 责任归属与免责
          </p>
          <p className="mt-2">
            The Client shall be responsible for any claims, losses or
            liabilities arising from the Client&apos;s misuse of the system or
            breach of its obligations, and HealthOptix shall not be liable for
            such matters.
          </p>
          <p className="mt-2 text-[#303030]/90">
            因客户对系统的不当使用或违反其义务所引起的任何索赔、损失或责任，由客户自行承担，HealthOptix
            对此不承担责任。
          </p>
        </li>
        <li>
          <p className="font-semibold text-[#003F73]">Data Disclosure / 数据披露</p>
          <p className="mt-2">
            HealthOptix may disclose data if required by law or authorities.
          </p>
          <p className="mt-2 text-[#303030]/90">如法律要求，可能披露数据。</p>
        </li>
      </ol>
    </>
  );
}
