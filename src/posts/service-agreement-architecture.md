---
title: Creating a Flexible Architecture for Custom Prompts
author: Stuart Urback
date: 2021-05-16T17:50:14.463Z
excerpt: Building service agreements.
layout: layouts/presentation.njk
writingType: presentation
hidden: true
---

<div class="reveal">
  <div class="slides"  data-background-color="rgb(70, 70, 255)">
    <section><h2>Custom Service Agreements<h2></section>
    <section>
      <h4>Prompt</h4>
      <p>Customers wanted their users to accept custom terms of service and privacy policy information for their team.</p>
    </section>
    <section>
      <h3>Terms</h3>
      <p><strong>Agreement:</strong>  A prompt like a terms of service or privacy policy that users have to accept to proceed.</p>
      <p><strong>Historical Agreement:</strong>  A past agreement of a type that has been replaced by a newer agreement</p>
      <p><strong>Type:</strong>  Differentiating the type of agreement being made</p>
      <p><strong>Acceptance:</strong>  A record of users accepting the agreement.</p>
    </section>
    <section>
      <h3>Context</h3>
      <section>
        <h4>Requirements</h4>
        <ul>
          <li>Needed to be able to track users' acceptance of agreements for compliance.</li>
          <li>When a policy was updated we needed to re-prompt the user to accept the new agreement.</li>
          <li>Users should not be re-prompted for agreements they've already accepted.</li>
          <li>Our customer success team had to be able to easily create new terms of service where necessary.</li>
        </ul>
      </section>
      <section>
        <h4>Existing Functionality</h4>
        <p>Our system already had concepts like "Terms of Service" and "Privacy Policy", but they were hard coded into the front end, and we couldn't update or track their acceptance over time.</p>
        <p>We had an existing on-boarding flow that we could tap into to require new prompts and acceptances.</p>
      </section>
      <section>
        <h4>Assumptions</h4>
        <ul>
          <li>Users are not given the option to decline</li>
          <li>Configuration will be managed by an internal team so we don't need to worry about users creating too many types of agreements.</li>
          <li>Won't need to build out custom admin functionality or new onboarding screens</li>
        </ul>
      </section>
      <section>
        <h4>Goals</h4>
        <ul>
          <li>The system should be agnostic about the "type" of agreement.</li>
          <li>Move existing hard-coded terms of service into the new functionality.</li>
        </ul>
      </section>
    </section>
    <section>
      <h3>Architecture</h3>
      <section>
        <h4>Backend</h4>
        <img src="/static/img/structures.png" />
      </section>
      <section>
        <h4>Testing</h4>
        <pre>
          <code data-trim>
            describe('Service agreement getter', () => {
              it('should not return accepted agreements', () => {});
              it('should not return unaccepted historical agreements', () => {});
              it('should not return agreements from another team', () => {});
              it('should not return agreements for a type their team does not use', () => {})
            })
          </code>
        </pre>
      </section>
      <section>
        <h4>Frontend</h4>
        <p>Modified the onboarding component to allow dynamically populated messsages from the API.</p>
        <p>Updated the "accept" button to fire a POST request.</p>
      </section>
    </section>
    <section>
      <h3>Solution</h3>
      <img src="/static/img/prompts.png">
    </section>
    <section>
      <h3>Questions?</h3>
    </section>
  </div>
</div>
