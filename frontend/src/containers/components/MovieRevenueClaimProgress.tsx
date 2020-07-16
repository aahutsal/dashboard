import React from 'react';
import styled from "styled-components";
import { Collapse, Spin, Progress } from "antd";
import { WarningFilled, CloseCircleFilled, ExceptionOutlined } from "@ant-design/icons";
import humanizeM49 from "../../stores/humanizeM49";
import { ClaimStatus, Claims } from './MovieRevenueList';

type MovieRevenueClaimProgressProps = {
  claims: Claims;
};

type ClaimStats = {
  [status: number]: number;
};

const TightCollapse = styled(Collapse)`
  & .ant-collapse-header {
    padding: 0 16px 0 40px !important;
  }

  & .ant-collapse-content-box {
    padding-left: 40px !important;
  }
`;

const ClaimStatusIndicator = ({ claimStats, style }: { 
  claimStats: ClaimStats,
  style?: any
 }) => {
  if (claimStats[ClaimStatus.PENDING] > 0) {
    return <Spin size="small" style={{ ...style, marginLeft: '7px', marginTop: '4px', lineHeight: 0 }} />; 
  }
  if (claimStats[ClaimStatus.FAILED] > 0) {
    return <WarningFilled style={{ ...style, marginLeft: '14px', marginTop: '4px', color: "#faad14" }}/>;
  }
  return <></>;
};

const FailedClaimsList = ({ claims }: { claims: Claims }) => (
  <TightCollapse
    ghost
    expandIcon={() =><CloseCircleFilled style={{ color: "#ff4d4f" }}/>}
  >
    <TightCollapse.Panel
      key="1"
      header={<span style={{ color: "#ff4d4f" }}>Failed to claim revenue for some of the regions. Click here for more details</span>}
    >
      Revenue claim failed for the following countries:
      <ul>
        {Object.entries(claims).map(([region, claim]) => {
          if (claim.status !== ClaimStatus.FAILED) return;
          return (
            <li key={`claim-failure-${region}`}>
              
              {' '}
              {humanizeM49[region]}
              {' '}
              <a
                target="_blank"
                href={`https://blockscout.com/poa/xdai/tx/${claim.txHash}`}
                title="See transaction on block explorer">
                <ExceptionOutlined style={{ opacity: 0.6, color: 'gray' }} />
              </a>
            </li>
          );
        })}
      </ul>
    </TightCollapse.Panel>
  </TightCollapse>
);

export default ({ claims }: MovieRevenueClaimProgressProps) => {
  const totalClaims = Object.keys(claims).length;

  const claimStats = Object.values(claims).reduce((stats, claim) => {
    stats[claim.status] = stats[claim.status] + 1;
    return stats;
  }, {
    [ClaimStatus.FAILED]: 0,
    [ClaimStatus.SUCCESS]: 0,
    [ClaimStatus.PENDING]: 0,
  } as ClaimStats);

  const processedPercent = Math.round(
    (claimStats[ClaimStatus.SUCCESS] + claimStats[ClaimStatus.FAILED]) / totalClaims * 100
  );

  const successPercent = Math.round(claimStats[ClaimStatus.SUCCESS] / totalClaims * 100);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Progress
          percent={processedPercent}
          success={{
            percent: successPercent,
            strokeColor: "#52c41a",
          }}
          strokeColor="#ff4d4f"
        />
        <ClaimStatusIndicator claimStats={claimStats} />
      </div>
      {claimStats[ClaimStatus.FAILED] > 0 && <FailedClaimsList claims={claims} />}
    </div>
  );
};